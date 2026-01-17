import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, deleteDoc, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Document as DocModel } from '../models';

@Injectable({
    providedIn: 'root'
})
export class DocumentsService {
    constructor(private firestore: Firestore) {}

    // Add document to order (subcollection)
    addDocument(orderId: string, document: Omit<DocModel, 'docId' | 'uploadedAt'>): Observable<string> {
        const docsRef = collection(this.firestore, `orders/${orderId}/documents`);
        const docData = {
            ...document,
            uploadedAt: Timestamp.now()
        };

        return from(addDoc(docsRef, docData)).pipe(map((docRef) => docRef.id));
    }

    // Get all documents for an order
    getOrderDocuments(orderId: string): Observable<DocModel[]> {
        const docsRef = collection(this.firestore, `orders/${orderId}/documents`);
        return from(getDocs(docsRef)).pipe(
            map((snapshot) =>
                snapshot.docs.map(
                    (doc) =>
                        ({
                            docId: doc.id,
                            ...doc.data(),
                            uploadedAt: doc.data()['uploadedAt']?.toDate()
                        }) as DocModel
                )
            )
        );
    }

    // Delete document
    deleteDocument(orderId: string, docId: string): Observable<void> {
        const docRef = doc(this.firestore, `orders/${orderId}/documents`, docId);
        return from(deleteDoc(docRef));
    }
}
