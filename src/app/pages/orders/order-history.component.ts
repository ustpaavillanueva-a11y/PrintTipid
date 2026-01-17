import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { switchMap, filter } from 'rxjs/operators';
import { OrdersService } from '@/app/services/orders.service';
import { UserService } from '@/app/services/user.service';
import { Order } from '@/app/models';

@Component({
    selector: 'app-order-history',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, TagModule, CardModule, TooltipModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="card">
            <p-card header="Completed Orders" styleClass="mb-0">
                <p-table [value]="orders" [rows]="10" [paginator]="true" responsiveLayout="scroll" [globalFilterFields]="['orderId']">
                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="orderId">Order ID <p-sortIcon field="orderId"></p-sortIcon></th>
                            <th pSortableColumn="createdAt">Date <p-sortIcon field="createdAt"></p-sortIcon></th>
                            <th pSortableColumn="totalAmount">Total <p-sortIcon field="totalAmount"></p-sortIcon></th>
                            <th pSortableColumn="status">Status <p-sortIcon field="status"></p-sortIcon></th>
                            <th>Payment</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-order>
                        <tr>
                            <td class="font-semibold">{{ order.orderId }}</td>
                            <td>{{ order.createdAt | date: 'MMM dd, yyyy HH:mm' }}</td>
                            <td class="font-semibold">₱{{ order.totalAmount | number: '1.2-2' }}</td>
                            <td>
                                <p-tag [value]="order.status | uppercase" [severity]="getStatusSeverity(order.status)"></p-tag>
                            </td>
                            <td>
                                <p-tag [value]="order.payment.status | uppercase" [severity]="getPaymentStatusSeverity(order.payment.status)"></p-tag>
                            </td>
                            <td>
                                <p-button icon="pi pi-eye" [rounded]="true" [text]="true" [routerLink]="['/pages/orders', order.orderId]" pTooltip="View Details" tooltipPosition="top"></p-button>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="6">
                                <div class="flex flex-col items-center justify-center py-12 text-center">
                                    <i class="pi pi-box text-4xl text-gray-300 mb-4"></i>
                                    <p class="text-lg font-semibold text-gray-600 mb-2">No Orders Found</p>
                                    <p class="text-sm text-gray-400 mb-6">You haven't placed any orders yet. Start by creating a new order.</p>
                                    <p-button label="Create Order" routerLink="/pages/orders/new" icon="pi pi-plus"></p-button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        </div>
    `
})
export class OrderHistoryComponent implements OnInit {
    private ordersService = inject(OrdersService);
    private userService = inject(UserService);
    private cdr = inject(ChangeDetectorRef);

    orders: Order[] = [];

    ngOnInit() {
        this.loadOrderHistory();
    }

    loadOrderHistory() {
        this.userService
            .getCurrentUserData()
            .pipe(
                filter((user) => {
                    return !!user?.uid;
                }),
                switchMap((user) => {
                    return this.ordersService.getUserOrders(user!.uid);
                })
            )
            .subscribe({
                next: (orders) => {
                    // Filter only completed orders
                    const filtered = orders.filter((order) => order.status === 'completed');
                    this.orders = filtered;
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    console.error('[OrderHistory] Failed to load order history:', err);
                }
            });
    }

    getStatusSeverity(status: string): 'info' | 'success' | 'warn' | 'danger' {
        switch (status) {
            case 'completed':
                return 'success';
            case 'processing':
                return 'info';
            case 'ready':
                return 'warn';
            case 'cancelled':
                return 'danger';
            default:
                return 'info';
        }
    }

    getPaymentStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
        switch (status) {
            case 'paid':
                return 'success';
            case 'pending':
                return 'warn';
            case 'unpaid':
                return 'danger';
            default:
                return 'warn';
        }
    }
}
