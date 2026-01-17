import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, Timestamp } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Service } from '../models';

@Injectable({
    providedIn: 'root'
})
export class ServicesService {
    private collectionName = 'services';

    constructor(private firestore: Firestore) {}

    // Create new service
    createService(service: Omit<Service, 'serviceId' | 'createdAt'>): Observable<string> {
        const servicesRef = collection(this.firestore, this.collectionName);
        const serviceData = {
            ...service,
            createdAt: Timestamp.now()
        };

        return from(addDoc(servicesRef, serviceData)).pipe(map((docRef) => docRef.id));
    }

    // Get all services
    getAllServices(): Observable<Service[]> {
        const servicesRef = collection(this.firestore, this.collectionName);
        return from(getDocs(servicesRef)).pipe(
            map((snapshot) =>
                snapshot.docs.map(
                    (doc) =>
                        ({
                            serviceId: doc.id,
                            ...doc.data(),
                            createdAt: doc.data()['createdAt']?.toDate(),
                            updatedAt: doc.data()['updatedAt']?.toDate()
                        }) as Service
                )
            )
        );
    }

    // Get active services only
    getActiveServices(): Observable<Service[]> {
        const servicesRef = collection(this.firestore, this.collectionName);
        const q = query(servicesRef, where('isActive', '==', true));

        return from(getDocs(q)).pipe(
            map((snapshot) =>
                snapshot.docs.map(
                    (doc) =>
                        ({
                            serviceId: doc.id,
                            ...doc.data(),
                            createdAt: doc.data()['createdAt']?.toDate(),
                            updatedAt: doc.data()['updatedAt']?.toDate()
                        }) as Service
                )
            )
        );
    }

    // Get single service
    getService(serviceId: string): Observable<Service | null> {
        const serviceRef = doc(this.firestore, this.collectionName, serviceId);
        return from(getDoc(serviceRef)).pipe(
            map((docSnap) => {
                if (docSnap.exists()) {
                    return {
                        serviceId: docSnap.id,
                        ...docSnap.data(),
                        createdAt: docSnap.data()['createdAt']?.toDate(),
                        updatedAt: docSnap.data()['updatedAt']?.toDate()
                    } as Service;
                }
                return null;
            })
        );
    }

    // Update service
    updateService(serviceId: string, data: Partial<Service>): Observable<void> {
        const serviceRef = doc(this.firestore, this.collectionName, serviceId);
        const updateData = {
            ...data,
            updatedAt: Timestamp.now()
        };
        return from(updateDoc(serviceRef, updateData));
    }

    // Delete service
    deleteService(serviceId: string): Observable<void> {
        const serviceRef = doc(this.firestore, this.collectionName, serviceId);
        return from(deleteDoc(serviceRef));
    }
}
