import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, query, where, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Payment } from '../models';
import { PaymentStatusType } from '../models/payment.model';

@Injectable({
    providedIn: 'root'
})
export class PaymentsService {
    private collectionName = 'payments';

    constructor(private firestore: Firestore) {}

    // Create payment
    createPayment(payment: Omit<Payment, 'paymentId' | 'createdAt'>): Observable<string> {
        const paymentsRef = collection(this.firestore, this.collectionName);
        const paymentData = {
            ...payment,
            createdAt: Timestamp.now()
        };

        return from(addDoc(paymentsRef, paymentData)).pipe(map((docRef) => docRef.id));
    }

    // Get payment by order
    getPaymentByOrder(orderId: string): Observable<Payment | null> {
        const paymentsRef = collection(this.firestore, this.collectionName);
        const q = query(paymentsRef, where('orderId', '==', orderId));

        return from(getDocs(q)).pipe(
            map((snapshot) => {
                if (!snapshot.empty) {
                    const docData = snapshot.docs[0].data();
                    return {
                        paymentId: snapshot.docs[0].id,
                        ...docData,
                        createdAt: docData['createdAt']?.toDate(),
                        paymentDate: docData['paymentDate']?.toDate(),
                        updatedAt: docData['updatedAt']?.toDate()
                    } as unknown as Payment;
                }
                return null;
            })
        );
    }

    // Get payments by user
    getUserPayments(userId: string): Observable<Payment[]> {
        const paymentsRef = collection(this.firestore, this.collectionName);
        const q = query(paymentsRef, where('userId', '==', userId));

        return from(getDocs(q)).pipe(
            map((snapshot) => {
                console.log(`[PaymentsService] Found ${snapshot.docs.length} payments for user ${userId}`);
                const payments = snapshot.docs.map((doc) => {
                    const docData = doc.data();
                    return {
                        paymentId: doc.id,
                        ...docData,
                        createdAt: docData['createdAt']?.toDate(),
                        paymentDate: docData['paymentDate']?.toDate(),
                        updatedAt: docData['updatedAt']?.toDate()
                    } as unknown as Payment;
                });
                console.log('[PaymentsService] Mapped payments:', payments);
                return payments;
            })
        );
    }

    // Get payments by status
    getPaymentsByStatus(status: PaymentStatusType): Observable<Payment[]> {
        const paymentsRef = collection(this.firestore, this.collectionName);
        const q = query(paymentsRef, where('status', '==', status));

        return from(getDocs(q)).pipe(
            map((snapshot) =>
                snapshot.docs.map(
                    (doc) =>
                        ({
                            paymentId: doc.id,
                            ...doc.data(),
                            createdAt: doc.data()['createdAt']?.toDate(),
                            paymentDate: doc.data()['paymentDate']?.toDate(),
                            updatedAt: doc.data()['updatedAt']?.toDate()
                        }) as unknown as Payment
                )
            )
        );
    }

    // Update payment
    updatePayment(paymentId: string, data: Partial<Payment>): Observable<void> {
        const paymentRef = doc(this.firestore, this.collectionName, paymentId);
        const updateData = {
            ...data,
            updatedAt: Timestamp.now()
        };
        return from(updateDoc(paymentRef, updateData));
    }

    // Verify payment (admin)
    verifyPayment(paymentId: string, adminUid: string): Observable<void> {
        return this.updatePayment(paymentId, {
            status: 'paid'
        });
    }
}
