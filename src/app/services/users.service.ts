import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, setDoc, updateDoc, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { User } from '../models';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    private collectionName = 'users';

    constructor(private firestore: Firestore) {}

    // Create or update user profile
    createUserProfile(uid: string, userData: Omit<User, 'uid' | 'createdAt' | 'updatedAt'>): Observable<void> {
        const userRef = doc(this.firestore, this.collectionName, uid);
        const data = {
            ...userData,
            uid,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };
        return from(setDoc(userRef, data));
    }

    // Get user profile
    getUserProfile(uid: string): Observable<User | null> {
        const userRef = doc(this.firestore, this.collectionName, uid);
        return from(getDoc(userRef)).pipe(
            map((docSnap) => {
                if (docSnap.exists()) {
                    return {
                        ...docSnap.data(),
                        createdAt: docSnap.data()['createdAt']?.toDate(),
                        updatedAt: docSnap.data()['updatedAt']?.toDate()
                    } as User;
                }
                return null;
            })
        );
    }

    // Update user profile
    updateUserProfile(uid: string, data: Partial<User>): Observable<void> {
        const userRef = doc(this.firestore, this.collectionName, uid);
        const updateData = {
            ...data,
            updatedAt: Timestamp.now()
        };
        return from(updateDoc(userRef, updateData));
    }
}
