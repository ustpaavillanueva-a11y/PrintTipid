import { Component, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '@/app/services/orders.service';
import { Order, OrderStatus } from '@/app/models';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { from, map } from 'rxjs';

@Component({
    selector: 'app-admin-payment-verification',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, TagModule, CardModule, TooltipModule, DialogModule, DividerModule, FormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="card">
            <p-card header="Pending Payment Verification" styleClass="mb-0">
                <p-table [value]="orders" [rows]="10" [paginator]="true" responsiveLayout="scroll" styleClass="p-datatable-striped">
                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="orderId">Order ID <p-sortIcon field="orderId"></p-sortIcon></th>
                            <th>Customer</th>
                            <th pSortableColumn="createdAt">Date <p-sortIcon field="createdAt"></p-sortIcon></th>
                            <th>Total</th>
                            <th>Payment Method</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-order>
                        <tr>
                            <td class="font-semibold">{{ order.orderId }}</td>
                            <td>{{ getCustomerName(order.userId) }}</td>
                            <td>{{ order.createdAt | date: 'MMM dd, yyyy HH:mm' }}</td>
                            <td class="font-semibold">₱{{ order.totalAmount | number: '1.2-2' }}</td>
                            <td>
                                <span class="capitalize">{{ order.payment.paymentMethod }}</span>
                            </td>
                            <td>
                                <p-button icon="pi pi-check" [rounded]="true" [text]="true" (click)="openVerifyModal(order)" pTooltip="Verify" tooltipPosition="top" severity="success"></p-button>
                                <p-button icon="pi pi-times" [rounded]="true" [text]="true" (click)="openRejectModal(order)" pTooltip="Reject" tooltipPosition="top" severity="danger"></p-button>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="6" class="text-center py-4">
                                <p class="text-muted-color">No pending payment verifications.</p>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        </div>

        <p-dialog [(visible)]="showVerifyModal" header="Verify Payment" [modal]="true" [style]="{ width: '40vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <div *ngIf="selectedOrder" class="space-y-4">
                <div>
                    <p class="text-sm text-gray-600">Order ID</p>
                    <p class="font-semibold text-lg">{{ selectedOrder.orderId }}</p>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Customer</p>
                    <p class="font-semibold">{{ getCustomerName(selectedOrder.userId) }}</p>
                </div>

                <div>
                    <p class="text-sm text-gray-600">Total Amount</p>
                    <p class="font-bold text-xl text-primary-600">₱{{ selectedOrder.totalAmount | number: '1.2-2' }}</p>
                </div>

                <div>
                    <p class="text-sm text-gray-600 mb-2">Payment Method</p>
                    <p class="font-semibold capitalize">{{ selectedOrder.payment.paymentMethod }}</p>
                </div>

                <div *ngIf="selectedOrder.payment.referenceNo">
                    <p class="text-sm text-gray-600 mb-2">Reference Number</p>
                    <p class="font-semibold text-sm bg-gray-50 p-2 rounded">{{ selectedOrder.payment.referenceNo }}</p>
                </div>

                <p-divider></p-divider>

                <div class="bg-green-50 border border-green-200 rounded p-3">
                    <p class="text-sm text-gray-600 mb-2">Confirm Payment Status</p>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" [(ngModel)]="confirmPaymentVerification" />
                        <span class="text-sm">I confirm this payment has been received and verified</span>
                    </label>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <p-button label="Cancel" (click)="showVerifyModal = false" severity="secondary"></p-button>
                <p-button label="Verify Payment" (click)="verifyPayment()" [disabled]="!confirmPaymentVerification" severity="success"> </p-button>
            </ng-template>
        </p-dialog>

        <p-dialog [(visible)]="showRejectModal" header="Reject Payment" [modal]="true" [style]="{ width: '40vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <div *ngIf="selectedOrder" class="space-y-4">
                <div>
                    <p class="text-sm text-gray-600">Order ID</p>
                    <p class="font-semibold text-lg">{{ selectedOrder.orderId }}</p>
                </div>

                <div class="bg-red-50 border border-red-200 rounded p-3">
                    <p class="text-sm text-gray-700 mb-2">Rejection Reason (Optional)</p>
                    <textarea [(ngModel)]="rejectionReason" class="w-full p-2 border border-red-300 rounded text-sm" rows="3" placeholder="Enter reason for rejecting this payment..."> </textarea>
                </div>

                <p-divider></p-divider>

                <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p class="text-sm text-gray-600 mb-2">Confirm Rejection</p>
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" [(ngModel)]="confirmPaymentRejection" />
                        <span class="text-sm">I confirm this payment should be rejected</span>
                    </label>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <p-button label="Cancel" (click)="showRejectModal = false" severity="secondary"></p-button>
                <p-button label="Reject Payment" (click)="rejectPayment()" [disabled]="!confirmPaymentRejection" severity="danger"> </p-button>
            </ng-template>
        </p-dialog>
    `
})
export class AdminPaymentVerificationComponent {
    private ordersService = inject(OrdersService);
    private cdr = inject(ChangeDetectorRef);
    private firestore = inject(Firestore);

    orders: Order[] = [];
    selectedOrder: Order | null = null;
    showVerifyModal = false;
    showRejectModal = false;
    confirmPaymentVerification = false;
    confirmPaymentRejection = false;
    rejectionReason = '';
    customerNames: Record<string, string> = {};

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.ordersService.getAllOrders().subscribe({
            next: (orders) => {
                // Filter orders with pending payment status
                const pendingOrders = orders.filter((order) => order.payment?.status === 'pending');

                this.orders = pendingOrders
                    .map((o) => this.normalizeOrder(o))
                    .sort((a, b) => {
                        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
                        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
                        return dateB - dateA; // Latest first
                    });

                this.loadCustomerNames();
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load pending payment orders', err);
                this.cdr.markForCheck();
            }
        });
    }

    private loadCustomerNames() {
        from(getDocs(collection(this.firestore, 'users')))
            .pipe(
                map((snapshot) => {
                    const mapObj: Record<string, string> = {};
                    snapshot.forEach((docSnap) => {
                        const data = docSnap.data() as any;
                        mapObj[docSnap.id] = data['name'] || data['displayName'] || data['email'] || docSnap.id;
                    });
                    return mapObj;
                })
            )
            .subscribe({
                next: (names) => {
                    this.customerNames = names;
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    console.error('Failed to load customer names', err);
                }
            });
    }

    openVerifyModal(order: Order) {
        this.selectedOrder = order;
        this.confirmPaymentVerification = false;
        this.showVerifyModal = true;
        this.cdr.markForCheck();
    }

    openRejectModal(order: Order) {
        this.selectedOrder = order;
        this.confirmPaymentRejection = false;
        this.rejectionReason = '';
        this.showRejectModal = true;
        this.cdr.markForCheck();
    }

    verifyPayment() {
        if (!this.selectedOrder) return;

        this.ordersService
            .updateOrder(this.selectedOrder.orderId!, {
                payment: {
                    ...this.selectedOrder.payment,
                    status: 'paid'
                }
            })
            .subscribe({
                next: () => {
                  
                    this.showVerifyModal = false;
                    this.confirmPaymentVerification = false;
                    this.loadOrders();
                },
                error: (err) => {
                    console.error('Failed to verify payment', err);
                }
            });
    }

    rejectPayment() {
        if (!this.selectedOrder) return;

        this.ordersService
            .updateOrder(this.selectedOrder.orderId!, {
                payment: {
                    ...this.selectedOrder.payment,
                    status: 'unpaid'
                }
            })
            .subscribe({
                next: () => {
                    this.showRejectModal = false;
                    this.confirmPaymentRejection = false;
                    this.rejectionReason = '';
                    this.loadOrders();
                },
                error: (err) => {
                    console.error('Failed to reject payment', err);
                }
            });
    }

    getCustomerName(uid: string): string {
        return this.customerNames[uid] || uid;
    }

    private normalizeOrder(order: Order): Order {
        const toDate = (val: any) => (val?.toDate ? val.toDate() : val instanceof Date ? val : val ? new Date(val) : undefined);

        return {
            ...order,
            createdAt: toDate(order.createdAt) as Date,
            updatedAt: toDate(order.updatedAt) as Date,
            printOptions: {
                ...order.printOptions,
                pickupDateTime: toDate(order.printOptions?.pickupDateTime) as Date | undefined
            }
        } as Order;
    }
}
