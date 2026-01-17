import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { switchMap, filter } from 'rxjs/operators';
import { OrdersService } from '@/app/services/orders.service';
import { UserService } from '@/app/services/user.service';
import { Order } from '@/app/models';

@Component({
    selector: 'app-customer-overview',
    standalone: true,
    imports: [CommonModule, CardModule, ChartModule, TableModule, TagModule, ButtonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <!-- Cover Image - Full Width -->
        <div class="-mx-6 rounded-lg overflow-hidden shadow-md mb-8">
            <img src="/cover.jpg" alt="Cover" class="w-screen block object-contain" style="max-height: 350px;" />
        </div>

        <!-- Stats Overview -->
        <div class="grid grid-cols-12 gap-6 mb-6">
            <!-- Total Orders -->
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Total Orders</span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ totalOrders }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-blue-100 dark:bg-blue-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-box text-blue-500 text-xl!"></i>
                        </div>
                    </div>
                    <span class="text-primary font-medium">{{ completedOrders }}</span>
                    <span class="text-muted-color"> completed</span>
                </div>
            </div>

            <!-- Pending Payments -->
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Pending Payments</span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ pendingPayments }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-orange-100 dark:bg-orange-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-clock text-orange-500 text-xl!"></i>
                        </div>
                    </div>
                    <span class="text-primary font-medium">₱{{ pendingAmount | number: '1.2-2' }}</span>
                    <span class="text-muted-color"> to pay</span>
                </div>
            </div>

            <!-- Total Spent -->
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Total Spent</span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">₱{{ totalSpent | number: '1.2-2' }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-green-100 dark:bg-green-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-shopping-bag text-green-500 text-xl!"></i>
                        </div>
                    </div>
                    <span class="text-primary font-medium">{{ paidOrders }}</span>
                    <span class="text-muted-color"> orders paid</span>
                </div>
            </div>

            <!-- Active Orders -->
            <div class="col-span-12 lg:col-span-6 xl:col-span-3">
                <div class="card mb-0">
                    <div class="flex justify-between mb-4">
                        <div>
                            <span class="block text-muted-color font-medium mb-4">Active Orders</span>
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-xl">{{ activeOrders }}</div>
                        </div>
                        <div class="flex items-center justify-center bg-cyan-100 dark:bg-cyan-400/10 rounded-border" style="width: 2.5rem; height: 2.5rem">
                            <i class="pi pi-spinner text-cyan-500 text-xl!"></i>
                        </div>
                    </div>
                    <span class="text-primary font-medium">{{ processingOrders }}</span>
                    <span class="text-muted-color"> in progress</span>
                </div>
            </div>
        </div>

        <!-- Recent Orders -->
        <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12">
                <p-card header="Recent Orders" [style]="{ marginBottom: '0' }">
                    <p-table [value]="recentOrders" [rows]="5" responsiveLayout="scroll">
                        <ng-template pTemplate="header">
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Payment</th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-order>
                            <tr>
                                <td class="font-mono text-sm">{{ order.orderId }}</td>
                                <td>{{ order.createdAt | date: 'MMM dd, yyyy' }}</td>
                                <td class="font-semibold">₱{{ order.totalAmount | number: '1.2-2' }}</td>
                                <td>
                                    <p-tag [value]="order.status | uppercase" [severity]="getStatusSeverity(order.status)"></p-tag>
                                </td>
                                <td>
                                    <p-tag [value]="order.payment.status | uppercase" [severity]="getPaymentStatusSeverity(order.payment.status)"></p-tag>
                                </td>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="emptymessage">
                            <tr>
                                <td colspan="5">
                                    <div class="text-center py-8 text-gray-500">No orders yet</div>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </p-card>
            </div>
        </div>
    `
})
export class CustomerOverviewComponent implements OnInit {
    private ordersService = inject(OrdersService);
    private userService = inject(UserService);
    private cdr = inject(ChangeDetectorRef);

    // Stats
    totalOrders = 0;
    completedOrders = 0;
    pendingPayments = 0;
    pendingAmount = 0;
    totalSpent = 0;
    paidOrders = 0;
    activeOrders = 0;
    processingOrders = 0;

    // Recent orders
    recentOrders: Order[] = [];

    ngOnInit() {
        this.loadDashboardData();
    }

    loadDashboardData() {
        this.userService
            .getCurrentUserData()
            .pipe(
                filter((user) => !!user?.uid),
                switchMap((user) => {
                    console.log('[CustomerOverview] Fetching orders for user:', user?.uid);
                    return this.ordersService.getUserOrders(user!.uid);
                })
            )
            .subscribe({
                next: (orders: Order[]) => {
                    console.log('[CustomerOverview] All orders:', orders);
                    this.calculateStats(orders);
                    this.recentOrders = orders.slice(0, 5);
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    console.error('[CustomerOverview] Failed to load orders:', err);
                }
            });
    }

    private calculateStats(orders: Order[]) {
        this.totalOrders = orders.length;

        let totalAmount = 0;
        let completedCount = 0;
        let paidCount = 0;
        let pendingPaymentCount = 0;
        let pendingAmount = 0;
        let activeCount = 0;
        let processingCount = 0;

        // Get today's date at midnight for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (const order of orders) {
            // Status-based counts
            if (order.status === 'completed') {
                completedCount++;
            } else if (order.status === 'processing') {
                processingCount++;
            } else if (order.status === 'pending' || order.status === 'ready') {
                // Only count as active if created today
                const orderDate = new Date(order.createdAt);
                orderDate.setHours(0, 0, 0, 0);
                if (orderDate.getTime() === today.getTime()) {
                    activeCount++;
                }
            }

            // Payment-based counts
            if (order.payment?.status === 'paid') {
                paidCount++;
                totalAmount += order.totalAmount || 0;
            } else if (order.payment?.status === 'pending') {
                pendingPaymentCount++;
                pendingAmount += order.totalAmount || 0;
            }
        }

        this.completedOrders = completedCount;
        this.pendingPayments = pendingPaymentCount;
        this.pendingAmount = pendingAmount;
        this.totalSpent = totalAmount;
        this.paidOrders = paidCount;
        this.activeOrders = activeCount;
        this.processingOrders = processingCount;

        console.log('[CustomerOverview] Stats calculated:', {
            totalOrders: this.totalOrders,
            completedOrders: this.completedOrders,
            pendingPayments: this.pendingPayments,
            pendingAmount: this.pendingAmount,
            totalSpent: this.totalSpent,
            activeOrders: this.activeOrders
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
