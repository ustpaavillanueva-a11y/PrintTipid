import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { switchMap, filter } from 'rxjs/operators';
import { OrdersService } from '@/app/services/orders.service';
import { UserService } from '@/app/services/user.service';
import { Order, Payment } from '@/app/models';

@Component({
    selector: 'app-pending-payments',
    standalone: true,
    imports: [CommonModule, RouterModule, CardModule, ButtonModule, TagModule, TableModule, TooltipModule, DialogModule, DividerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="card">
            <p-card header="Pending Payments" styleClass="mb-0">
                <p-table [value]="pendingPayments" [rows]="10" [paginator]="true" responsiveLayout="scroll">
                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="referenceNo">Reference No. <p-sortIcon field="referenceNo"></p-sortIcon></th>
                            <th pSortableColumn="amount">Amount <p-sortIcon field="amount"></p-sortIcon></th>
                            <th>Payment Method</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-payment>
                        <tr>
                            <td class="font-mono text-sm">{{ payment.referenceNo || 'N/A' }}</td>
                            <td class="font-semibold">₱{{ payment.amount | number: '1.2-2' }}</td>
                            <td class="capitalize">{{ payment.paymentMethod }}</td>
                            <td>
                                <p-tag [value]="payment.status | uppercase" severity="warn"></p-tag>
                            </td>
                            <td>
                                <p-button icon="pi pi-info-circle" [rounded]="true" [text]="true" (click)="viewPaymentDetails(payment)" pTooltip="View Details" tooltipPosition="top"></p-button>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="5">
                                <div class="flex flex-col items-center justify-center py-12 text-center">
                                    <i class="pi pi-check-circle text-4xl text-gray-300 mb-4"></i>
                                    <p class="text-sm text-gray-400 mb-6">You don't have any pending payments at the moment.</p>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        </div>

        <!-- Payment Details Modal -->
        <p-dialog [(visible)]="showModal" header="Payment Details" [modal]="true" [style]="{ width: '50vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <div *ngIf="selectedOrder" class="space-y-4">
                <!-- Payment Info -->
                <div>
                    <h3 class="font-semibold mb-3">Payment Information</h3>
                    <div class="bg-blue-50 p-4 rounded mb-3">
                        <p class="text-gray-600 text-sm">Amount</p>
                        <p class="font-bold text-2xl text-primary-600">₱{{ selectedOrder.payment.amount | number: '1.2-2' }}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <p class="text-gray-600 text-sm">Payment Method</p>
                            <p class="font-semibold capitalize">{{ selectedOrder.payment.paymentMethod }}</p>
                        </div>
                        <div>
                            <p class="text-gray-600 text-sm">Payment Status</p>
                            <p-tag [value]="selectedOrder.payment.status | uppercase" severity="warn" class="mt-1"></p-tag>
                        </div>
                    </div>
                </div>

                <p-divider></p-divider>

                <!-- Order Info -->
                <div>
                    <h3 class="font-semibold mb-3">Order Information</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <p class="text-gray-600 text-sm">Order ID</p>
                            <p class="font-semibold">{{ selectedOrder.orderId }}</p>
                        </div>
                        <div>
                            <p class="text-gray-600 text-sm">Status</p>
                            <p-tag [value]="selectedOrder.status | uppercase" [severity]="getStatusSeverity(selectedOrder.status)" class="mt-1"></p-tag>
                        </div>
                    </div>
                    <div class="mt-3">
                        <p class="text-gray-600 text-sm">Service</p>
                        <p class="font-semibold">{{ selectedOrder.serviceId }}</p>
                    </div>
                    <div class="mt-3">
                        <p class="text-gray-600 text-sm">Total Amount</p>
                        <p class="font-semibold">₱{{ selectedOrder.totalAmount | number: '1.2-2' }}</p>
                    </div>
                </div>

                <p-divider></p-divider>

                <!-- Print Options -->
                <div *ngIf="selectedOrder.printOptions">
                    <h3 class="font-semibold mb-3">Print Options</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div class="bg-blue-50 p-3 rounded">
                            <p class="text-gray-600 text-sm">Paper Size</p>
                            <p class="font-semibold">{{ selectedOrder.printOptions.paperSize }}</p>
                        </div>
                        <div class="bg-green-50 p-3 rounded">
                            <p class="text-gray-600 text-sm">Color Mode</p>
                            <p class="font-semibold">{{ formatColorMode(selectedOrder.printOptions.colorMode) }}</p>
                        </div>
                        <div class="bg-purple-50 p-3 rounded">
                            <p class="text-gray-600 text-sm">Paper Type</p>
                            <p class="font-semibold capitalize">{{ selectedOrder.printOptions.paperType }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <p-button label="Close" icon="pi pi-times" (click)="showModal = false" severity="secondary"></p-button>
            </ng-template>
        </p-dialog>
    `
})
export class PendingPaymentsComponent implements OnInit {
    private ordersService = inject(OrdersService);
    private userService = inject(UserService);
    private cdr = inject(ChangeDetectorRef);

    pendingPayments: Payment[] = [];
    showModal = false;
    selectedOrder: Order | null = null;
    orders: Order[] = [];

    ngOnInit() {
        this.loadPendingPayments();
    }

    loadPendingPayments() {
        this.userService
            .getCurrentUserData()
            .pipe(
                filter((user) => {
                    console.log('[PendingPayments] User data:', user);
                    return !!user?.uid;
                }),
                switchMap((user) => {
                    console.log('[PendingPayments] Fetching orders for user:', user?.uid);
                    // Fetch orders to get payment data
                    return this.ordersService.getUserOrders(user!.uid);
                })
            )
            .subscribe({
                next: (orders) => {
                    console.log('[PendingPayments] All orders:', orders);
                    this.orders = orders;
                    // Extract payments from orders where payment status is 'pending'
                    const pendingPayments = orders
                        .filter((o) => o.payment?.status === 'pending')
                        .map((o) => ({
                            ...o.payment,
                            paymentId: o.orderId,
                            orderId: o.orderId,
                            referenceNo: o.orderId
                        }));
                    console.log('[PendingPayments] Pending payments:', pendingPayments);
                    this.pendingPayments = pendingPayments as Payment[];
                    this.cdr.markForCheck();
                },
                error: (err: any) => {
                    console.error('[PendingPayments] Failed to load pending payments:', err);
                }
            });
    }

    viewPaymentDetails(payment: Payment) {
        // Find the order that corresponds to this payment using referenceNo (which is orderId)
        const order = this.orders.find((o) => o.orderId === payment.referenceNo);
        if (order) {
            this.selectedOrder = order;
            this.showModal = true;
        }
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

    formatColorMode(mode: string): string {
        return mode === 'bw' ? 'Black & White' : 'Color';
    }
}
