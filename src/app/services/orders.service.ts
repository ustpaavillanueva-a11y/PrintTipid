import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Order, OrderStatus } from '../models';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    private collectionName = 'orders';

    constructor(private firestore: Firestore) {}

    // Create new order
    createOrder(order: Omit<Order, 'orderId' | 'createdAt' | 'updatedAt'>): Observable<string> {
        const ordersRef = collection(this.firestore, this.collectionName);
        const orderData = {
            ...order,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };

        return from(addDoc(ordersRef, orderData)).pipe(map((docRef) => docRef.id));
    }

    // Get all orders
    getAllOrders(): Observable<Order[]> {
        const ordersRef = collection(this.firestore, this.collectionName);
        return from(getDocs(ordersRef)).pipe(
            map((snapshot) =>
                snapshot.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        orderId: doc.id,
                        ...data,
                        createdAt: data['createdAt']?.toDate ? data['createdAt'].toDate() : new Date(data['createdAt']),
                        updatedAt: data['updatedAt']?.toDate ? data['updatedAt'].toDate() : new Date(data['updatedAt'])
                    } as Order;
                })
            )
        );
    }

    // Convenience: fetch all orders and log them
    getAllOrdersWithLog(): void {
        this.getAllOrders().subscribe({
            next: (orders) => {
                console.log('[OrdersService] All orders:', orders);
            },
            error: (err) => {
                console.error('[OrdersService] Failed to load all orders', err);
            }
        });
    }

    // Get orders by user
    getUserOrders(userId: string): Observable<Order[]> {
        const ordersRef = collection(this.firestore, this.collectionName);
        const q = query(ordersRef, where('userId', '==', userId));

        return from(getDocs(q)).pipe(
            map((snapshot) => {
                console.log(`[OrdersService] Found ${snapshot.docs.length} orders for user ${userId}`);
                const orders = snapshot.docs.map(
                    (doc) =>
                        ({
                            orderId: doc.id,
                            ...doc.data(),
                            createdAt: doc.data()['createdAt']?.toDate(),
                            updatedAt: doc.data()['updatedAt']?.toDate()
                        }) as Order
                );
                console.log('[OrdersService] Mapped orders:', orders);
                return orders;
            })
        );
    }

    // Get orders by status
    getOrdersByStatus(status: OrderStatus): Observable<Order[]> {
        const ordersRef = collection(this.firestore, this.collectionName);
        const q = query(ordersRef, where('status', '==', status));

        return from(getDocs(q)).pipe(
            map((snapshot) =>
                snapshot.docs.map(
                    (doc) =>
                        ({
                            orderId: doc.id,
                            ...doc.data(),
                            createdAt: doc.data()['createdAt']?.toDate(),
                            updatedAt: doc.data()['updatedAt']?.toDate()
                        }) as Order
                )
            )
        );
    }

    // Get single order
    getOrder(orderId: string): Observable<Order | null> {
        const orderRef = doc(this.firestore, this.collectionName, orderId);
        return from(getDoc(orderRef)).pipe(
            map((docSnap) => {
                if (docSnap.exists()) {
                    return {
                        orderId: docSnap.id,
                        ...docSnap.data(),
                        createdAt: docSnap.data()['createdAt']?.toDate(),
                        updatedAt: docSnap.data()['updatedAt']?.toDate()
                    } as Order;
                }
                return null;
            })
        );
    }

    // Update order
    updateOrder(orderId: string, data: Partial<Order>): Observable<void> {
        const orderRef = doc(this.firestore, this.collectionName, orderId);
        const updateData = {
            ...data,
            updatedAt: Timestamp.now()
        };
        return from(updateDoc(orderRef, updateData));
    }

    // Update order status
    updateOrderStatus(orderId: string, status: OrderStatus): Observable<void> {
        return this.updateOrder(orderId, { status });
    }

    // Delete order
    deleteOrder(orderId: string): Observable<void> {
        const orderRef = doc(this.firestore, this.collectionName, orderId);
        return from(deleteDoc(orderRef));
    }
}
