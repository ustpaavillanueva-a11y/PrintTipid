import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, setDoc, Timestamp } from '@angular/fire/firestore';
import { Observable, from, BehaviorSubject, map, switchMap, of, catchError } from 'rxjs';
import { User as FirebaseAuthUser } from '@angular/fire/auth';
import { User, UserRole } from '../models/user.model';
import { FirebaseService } from './firebase.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private currentUserData$ = new BehaviorSubject<User | null>(null);
    private collectionName = 'users';

    constructor(
        private firestore: Firestore,
        private firebaseService: FirebaseService
    ) {
        // Listen to auth state and fetch/create user data
        this.firebaseService
            .getCurrentUser()
            .pipe(
                switchMap((authUser) => {
                    if (!authUser) {
                        return of(null);
                    }

                    // Try to fetch existing user doc
                    return this.getUserData(authUser.uid).pipe(
                        switchMap((userData) => {
                            if (userData) {
                                return of(userData);
                            }
                            // Auto-create user doc if missing (default role customer)
                            return this.createUser(authUser, 'customer').pipe(
                                switchMap(() => this.getUserData(authUser.uid)),
                                catchError((err) => {
                                    console.error('[UserService] createUser failed', err);
                                    return of(null);
                                })
                            );
                        }),
                        catchError((err) => {
                            console.error('[UserService] getUserData failed', err);
                            return of(null);
                        })
                    );
                })
            )
            .subscribe({
                next: (userData) => {
                    this.currentUserData$.next(userData);
                },
                error: (err) => {
                    console.error('Failed to fetch/create user data', err);
                    this.currentUserData$.next(null);
                }
            });
    }

    // Create user document in Firestore (called after registration)
    createUser(authUser: FirebaseAuthUser, role: UserRole = 'customer'): Observable<void> {
        const userRef = doc(this.firestore, this.collectionName, authUser.uid);
        const userData: any = {
            uid: authUser.uid,
            email: authUser.email || '',
            name: authUser.displayName || authUser.email?.split('@')[0] || 'User',
            role: role,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        if (authUser.photoURL) {
            userData.photoURL = authUser.photoURL;
        }

        return from(setDoc(userRef, userData));
    }

    // Get user data from Firestore
    getUserData(uid: string): Observable<User | null> {
        const userRef = doc(this.firestore, this.collectionName, uid);
        return from(getDoc(userRef)).pipe(
            map((docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    const mapped: User = {
                        uid: docSnap.id,
                        email: data['email'] || '',
                        name: data['name'] || data['displayName'] || data['email']?.split('@')[0] || 'User',
                        role: data['role'] || 'customer',
                        phone: data['phone'],
                        address: data['address'],
                        photoURL: data['photoURL'],
                        createdAt: data['createdAt']?.toDate ? data['createdAt'].toDate() : new Date(data['createdAt']),
                        updatedAt: data['updatedAt']?.toDate ? data['updatedAt'].toDate() : new Date(data['updatedAt'])
                    };
                    return mapped;
                }
                return null;
            })
        );
    }

    // Get current user data as observable
    getCurrentUserData(): Observable<User | null> {
        return this.currentUserData$.asObservable();
    }

    // Get current user data value
    get currentUserDataValue(): User | null {
        return this.currentUserData$.value;
    }

    // Get user role
    getUserRole(): Observable<UserRole> {
        return this.currentUserData$.pipe(map((user) => user?.role || 'guest'));
    }

    // Update user profile
    updateUserProfile(uid: string, data: Partial<User>): Observable<void> {
        const userRef = doc(this.firestore, this.collectionName, uid);
        return from(
            setDoc(
                userRef,
                {
                    ...data,
                    updatedAt: Timestamp.now()
                },
                { merge: true }
            )
        );
    }
}
