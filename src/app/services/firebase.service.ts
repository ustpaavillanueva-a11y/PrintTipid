import { Injectable, NgZone } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence } from '@angular/fire/auth';
import { Firestore, collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc, QuerySnapshot, DocumentData } from '@angular/fire/firestore';
import { Observable, from, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {
    private currentUser$ = new BehaviorSubject<User | null>(null);
    private authInitialized$ = new BehaviorSubject<boolean>(false);

    constructor(
        private auth: Auth,
        private firestore: Firestore,
        private ngZone: NgZone
    ) {
        // Enable persistence so sessions persist across page refreshes
        setPersistence(this.auth, browserLocalPersistence).catch((err) => {
            console.error('Persistence configuration failed', err);
        });

        // Track auth state
        this.ngZone.runOutsideAngular(() => {
            onAuthStateChanged(this.auth, (user) => {
                this.ngZone.run(() => {
                    this.currentUser$.next(user);
                    // Mark auth as initialized after first state change
                    this.authInitialized$.next(true);
                });
            });
        });
    }

    // ===== AUTHENTICATION =====

    register(email: string, password: string) {
        return from(createUserWithEmailAndPassword(this.auth, email, password));
    }

    login(email: string, password: string) {
        return from(signInWithEmailAndPassword(this.auth, email, password));
    }

    loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        return from(signInWithPopup(this.auth, provider));
    }

    logout() {
        return from(signOut(this.auth));
    }

    getCurrentUser(): Observable<User | null> {
        return this.currentUser$.asObservable();
    }

    get currentUserValue(): User | null {
        return this.currentUser$.value;
    }

    isAuthInitialized(): Observable<boolean> {
        return this.authInitialized$.asObservable();
    }

    // ===== FIRESTORE - GENERIC CRUD =====

    // Create Document
    addDocument(collectionName: string, data: any) {
        const ref = collection(this.firestore, collectionName);
        return from(
            addDoc(ref, {
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            })
        );
    }

    // Read All Documents
    getDocuments(collectionName: string): Observable<QuerySnapshot<DocumentData>> {
        const ref = collection(this.firestore, collectionName);
        return from(getDocs(ref));
    }

    // Read with Filter
    getDocumentsWhere(collectionName: string, fieldPath: string, operator: any, value: any): Observable<QuerySnapshot<DocumentData>> {
        const ref = collection(this.firestore, collectionName);
        const q = query(ref, where(fieldPath, operator, value));
        return from(getDocs(q));
    }

    // Update Document
    updateDocument(collectionName: string, docId: string, data: any) {
        const docRef = doc(this.firestore, collectionName, docId);
        return from(
            updateDoc(docRef, {
                ...data,
                updatedAt: new Date()
            })
        );
    }

    // Delete Document
    deleteDocument(collectionName: string, docId: string) {
        const docRef = doc(this.firestore, collectionName, docId);
        return from(deleteDoc(docRef));
    }
}
