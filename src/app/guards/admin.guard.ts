import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { UserService } from '../services/user.service';

export const adminGuard = () => {
    const userService = inject(UserService);
    const router = inject(Router);

    return userService.getUserRole().pipe(
        take(1),
        map((role) => {
            if (role === 'admin') {
                return true;
            } else {
                router.navigate(['/dashboard']);
                return false;
            }
        })
    );
};
