import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerOverviewComponent } from './components/customer-overview.component';
import { AdminOverviewComponent } from './components/admin-overview.component';
import { UserService } from '@/app/services/user.service';
import { OrdersService } from '@/app/services/orders.service';
import { filter, switchMap } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, CustomerOverviewComponent, AdminOverviewComponent, ButtonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <ng-container *ngIf="isAdmin">
            <app-admin-overview />
        </ng-container>
        <ng-container *ngIf="!isAdmin">
            <app-customer-overview />
        </ng-container>
    `
})
export class Dashboard implements OnInit {
    private userService = inject(UserService);
    private ordersService = inject(OrdersService);
    private cdr = inject(ChangeDetectorRef);

    isAdmin = false;

    ngOnInit() {
        this.checkUserRole();
    }

    checkUserRole() {
        this.userService
            .getCurrentUserData()
            .pipe(
                filter((user) => !!user),
                switchMap((user) => {
                    this.isAdmin = user?.role === 'admin';
                    this.cdr.markForCheck();
                    return [];
                })
            )
            .subscribe();
    }
}
