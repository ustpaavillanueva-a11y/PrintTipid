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
        <div style="padding: 1rem;">
            <p-button label="🔍 Debug: View All Orders in Console" (click)="debugLogAllOrders()" severity="info" text></p-button>
        </div>
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
                    console.log('[Dashboard] Current user:', user);
                    this.isAdmin = user?.role === 'admin';
                    console.log('[Dashboard] Is admin:', this.isAdmin);
                    this.cdr.markForCheck();
                    return [];
                })
            )
            .subscribe();
    }

    debugLogAllOrders() {
        this.ordersService.getAllOrders().subscribe({
            next: (orders) => {
                console.log('=== ALL ORDERS ===');
                console.table(orders);
                orders.forEach((order, idx) => {
                    console.log(`\n📋 Order ${idx + 1}: ${order.orderId}`);
                    console.log('  Status:', order.status);
                    console.log('  Documents:', order.documents);
                    if (order.documents && order.documents.length > 0) {
                        order.documents.forEach((doc, docIdx) => {
                            console.log(`    File ${docIdx + 1}:`, {
                                fileName: doc.fileName,
                                fileSize: doc.fileSize,
                                hasFileData: !!doc.fileData,
                                uploadedAt: doc.uploadedAt
                            });
                        });
                    }
                });
            },
            error: (err) => console.error('Error loading orders:', err)
        });
    }
}
