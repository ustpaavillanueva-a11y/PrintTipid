# Firebase Setup Guide - NathyPrint Printing Services Management System

Complete step-by-step guide para i-setup ang Firebase sa NathyPrint PWA.

---

## Table of Contents
1. [Firebase Project Creation](#1-firebase-project-creation)
2. [Firebase Configuration](#2-firebase-configuration)
3. [Install Dependencies](#3-install-dependencies)
4. [Create Environment Config](#4-create-environment-config)
5. [Setup AngularFire](#5-setup-angularfire)
6. [Enable Firestore Database](#6-enable-firestore-database)
7. [Enable Authentication](#7-enable-authentication)
8. [Create Firebase Services](#8-create-firebase-services)
9. [Setup Security Rules](#9-setup-security-rules)
10. [Testing](#10-testing)

---

## 1. Firebase Project Creation

### A. Go to Firebase Console
- Open: https://console.firebase.google.com/
- Log in with your Google account

### B. Create Project
1. Click **"Create a project"** or **"Add project"**
2. Enter Project Name: `NathyPrint`
3. (Optional) Disable Google Analytics
4. Click **"Create Project"**
5. Wait for project initialization (2-3 minutes)

### C. Create Web App
1. In Firebase Console, click **"</>  (Web)"** under "Get started by adding Firebase to your app"
2. App Name: `NathyPrint`
3. Check "Also set up Firebase Hosting for this app" (optional, for later deployment)
4. Click **"Register app"**
5. Copy the Firebase config (next step)

---

## 2. Firebase Configuration

### Get Your Firebase Config
In Firebase Console after registering web app, you'll see:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "nathyprint-xxxx.firebaseapp.com",
  projectId: "nathyprint-xxxx",
  storageBucket: "nathyprint-xxxx.appspot.com",
  messagingSenderId: "xxxx",
  appId: "1:xxxx:web:xxxx"
};
```

**Copy this entire config - you'll need it in Step 4**

---

## 3. Install Dependencies

### Already Installed ✓
Firebase and AngularFire have been installed:
```bash
npm install firebase @angular/fire --legacy-peer-deps
```

If you need to install again, run the above command in terminal.

---

## 4. Create Environment Config

### Create Environment Folder
```bash
mkdir src/environments
```

### Create Firebase Config File
**File:** `src/environments/firebase.config.ts`

```typescript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "1:YOUR_APP_ID:web:YOUR_WEB_ID"
};
```

**Replace all "YOUR_*" values with your actual Firebase config from Step 2**

### .gitignore (Keep Firebase Config Secure)
Add to `.gitignore`:
```
src/environments/firebase.config.ts
```

This prevents uploading Firebase credentials to GitHub.

---

## 5. Setup AngularFire

### Update `src/app.config.ts`

Replace the entire file with:

```typescript
import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { firebaseConfig } from '../environments/firebase.config';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch()),
        provideZonelessChangeDetection(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
        provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
        }),
        // Firebase Configuration
        provideFirebaseApp(() => initializeApp(firebaseConfig)),
        provideAuth(() => getAuth()),
        provideFirestore(() => getFirestore())
    ]
};
```

---

## 6. Enable Firestore Database

### Setup Firestore in Firebase Console

1. Go to Firebase Console → **Build** → **Firestore Database**
2. Click **"Create Database"**
3. Choose location:
   - **Asia Southeast 1 (Singapore)** - closest to Philippines
   - Or select your preferred region
4. Start in **Test Mode** (for development)
5. Click **"Enable"**
6. Wait for initialization (1-2 minutes)

### Test Mode Rules (Development Only)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Important:** Change to Locked Mode before production!

---

## 7. Enable Authentication

### Setup Auth in Firebase Console

1. Go to Firebase Console → **Build** → **Authentication**
2. Click **"Get started"** 
3. Under **Sign-in method**, click **"Email/Password"**
4. Enable **Email/Password**
5. Click **"Save"**

### (Optional) Enable Additional Providers
- Google Sign-In
- Facebook Login
- Phone Authentication

---

## 8. Create Firebase Services

### Create Services Folder
```bash
mkdir src/app/services
```

### Create Firebase Service
**File:** `src/app/services/firebase.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, onAuthStateChanged, User } from '@angular/fire/auth';
import { Firestore, collection, addDoc, getDocs, query, where, updateDoc, deleteDoc, doc } from '@angular/fire/firestore';
import { Observable, from, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private currentUser$ = new BehaviorSubject<User | null>(null);

  constructor(private auth: Auth, private firestore: Firestore) {
    // Track auth state
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser$.next(user);
    });
  }

  // ===== AUTHENTICATION =====
  
  register(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  logout() {
    return from(signOut(this.auth));
  }

  getCurrentUser() {
    return this.currentUser$.asObservable();
  }

  // ===== FIRESTORE - GENERIC CRUD =====

  // Create Document
  addDocument(collectionName: string, data: any) {
    const ref = collection(this.firestore, collectionName);
    return from(addDoc(ref, {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  // Read All Documents
  getDocuments(collectionName: string) {
    const ref = collection(this.firestore, collectionName);
    return from(getDocs(ref));
  }

  // Read with Filter
  getDocumentsWhere(collectionName: string, fieldPath: string, operator: any, value: any) {
    const ref = collection(this.firestore, collectionName);
    const q = query(ref, where(fieldPath, operator, value));
    return from(getDocs(q));
  }

  // Update Document
  updateDocument(collectionName: string, docId: string, data: any) {
    const docRef = doc(this.firestore, collectionName, docId);
    return from(updateDoc(docRef, {
      ...data,
      updatedAt: new Date()
    }));
  }

  // Delete Document
  deleteDocument(collectionName: string, docId: string) {
    const docRef = doc(this.firestore, collectionName, docId);
    return from(deleteDoc(docRef));
  }
}
```

### Create Orders Service (Example)
**File:** `src/app/services/orders.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Order {
  id?: string;
  customerName: string;
  email: string;
  phone: string;
  printType: string; // e.g., "flyers", "brochures", "business-cards"
  quantity: number;
  description: string;
  status: string; // "pending", "processing", "completed"
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private firebaseService: FirebaseService) { }

  createOrder(order: Order): Observable<any> {
    return this.firebaseService.addDocument('orders', order);
  }

  getOrders(): Observable<Order[]> {
    return this.firebaseService.getDocuments('orders').pipe(
      map((snapshot: any) => snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })))
    );
  }

  getOrdersByStatus(status: string): Observable<Order[]> {
    return this.firebaseService.getDocumentsWhere('orders', 'status', '==', status).pipe(
      map((snapshot: any) => snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })))
    );
  }

  updateOrder(orderId: string, order: Partial<Order>): Observable<void> {
    return this.firebaseService.updateDocument('orders', orderId, order) as Observable<void>;
  }

  deleteOrder(orderId: string): Observable<void> {
    return this.firebaseService.deleteDocument('orders', orderId) as Observable<void>;
  }
}
```

---

## 9. Setup Security Rules

### Update Firestore Security Rules

In Firebase Console → **Firestore Database** → **Rules**, replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Orders - authenticated users can read/write
    match /orders/{docId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
      allow delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }

    // Products - public read, admin write
    match /products/{docId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

Click **"Publish"** to save.

---

## 10. Testing

### A. Test Firebase Setup

Add this to a component to test connection:

```typescript
import { Component, OnInit } from '@angular/core';
import { FirebaseService } from './services/firebase.service';

@Component({
  selector: 'app-test',
  template: `<h1>Firebase Test</h1><p>Check console for results</p>`
})
export class TestComponent implements OnInit {
  constructor(private firebaseService: FirebaseService) {}

  ngOnInit() {
    // Test Register
    this.firebaseService.register('test@example.com', 'password123').subscribe(
      (result) => console.log('Register Success:', result),
      (error) => console.log('Register Error:', error)
    );
  }
}
```

### B. Check Browser Console
- Open DevTools → **Console**
- Look for success/error messages
- No errors = Firebase is connected! ✓

### C. Check Firestore
- Firebase Console → **Firestore Database**
- Data tab should show documents being created/read
- If empty, test data creation from app

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Firebase config not found" | Check `firebaseConfig` import path in `app.config.ts` |
| "Module not found: @angular/fire" | Run `npm install firebase @angular/fire --legacy-peer-deps` |
| "Cannot connect to Firestore" | Check Firestore is enabled in Firebase Console |
| "Permission denied" | Check Firestore Security Rules - start with Test Mode |
| "Auth not working" | Enable Email/Password in Firebase Console → Authentication |

---

## Next Steps

1. **Create UI Components** for:
   - Login/Register page
   - Order management dashboard
   - Product catalog

2. **Implement CRUD Operations**:
   - Create new orders
   - View orders list
   - Update order status
   - Delete orders

3. **Add Firebase Analytics** (optional)

4. **Deploy to Firebase Hosting** (for production)

---

## Firebase Console Links Reference

**Your Firebase Console URL:**
```
https://console.firebase.google.com/project/YOUR_PROJECT_ID/overview
```

**Replace YOUR_PROJECT_ID with your actual project ID from Firebase config**

---

## Support
For more info:
- [Angular Fire Docs](https://github.com/angular/angularfire)
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
