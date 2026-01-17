import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, switchMap, take, filter } from 'rxjs/operators';
import { FirebaseService } from '../services/firebase.service';

export const authGuard = () => {
    const firebaseService = inject(FirebaseService);
    const router = inject(Router);

    return firebaseService.isAuthInitialized().pipe(
        // Wait for Firebase to determine auth state
        filter((initialized) => initialized === true),
        take(1),
        switchMap(() => firebaseService.getCurrentUser()),
        take(1),
        map((user) => {
            if (user) {
                return true;
            } else {
                router.navigate(['/auth/login']);
                return false;
            }
        })
    );
};
