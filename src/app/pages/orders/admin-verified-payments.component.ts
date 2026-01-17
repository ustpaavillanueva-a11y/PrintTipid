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
import { OrdersService } from '@/app/services/orders.service';
import { Order, OrderStatus } from '@/app/models';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { from, map } from 'rxjs';

@Component({
    selector: 'app-admin-verified-payments',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, TagModule, CardModule, TooltipModule, DialogModule, DividerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="card">
            <p-card header="Verified Payments" styleClass="mb-0">
                <p-table [value]="orders" [rows]="10" [paginator]="true" responsiveLayout="scroll" styleClass="p-datatable-striped">
                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="orderId">Order ID <p-sortIcon field="orderId"></p-sortIcon></th>
                            <th>Customer</th>
                            <th pSortableColumn="createdAt">Order Date <p-sortIcon field="createdAt"></p-sortIcon></th>
                            <th>Total</th>
                            <th>Payment Method</th>
                            <th>Order Status</th>
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
                                <p-tag [value]="getStatusLabel(order.status)" [severity]="getStatusSeverity(order.status)"> </p-tag>
                            </td>
                            <td>
                                <p-button icon="pi pi-eye" [rounded]="true" [text]="true" (click)="openModal(order)" pTooltip="View Details" tooltipPosition="top"></p-button>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="7" class="text-center py-4">
                                <p class="text-muted-color">No verified payments found.</p>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        </div>

        <p-dialog [(visible)]="showModal" [header]="selectedOrder?.orderId" [modal]="true" [style]="{ width: '50vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <div *ngIf="selectedOrder" class="space-y-4">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm text-gray-600">Customer</p>
                        <p class="font-semibold">{{ getCustomerName(selectedOrder.userId) }}</p>
                    </div>
                    <p-tag value="PAID" severity="success"></p-tag>
                </div>

                <p-divider></p-divider>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600">Order Date</p>
                        <p class="font-semibold">{{ selectedOrder.createdAt | date: 'MMM dd, yyyy HH:mm' }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Last Updated</p>
                        <p class="font-semibold">{{ selectedOrder.updatedAt | date: 'MMM dd, yyyy HH:mm' }}</p>
                    </div>
                </div>

                <p-divider></p-divider>

                <div>
                    <h3 class="font-semibold mb-3">Print Options</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div class="bg-blue-50 p-3 rounded">
                            <p class="text-gray-600 text-sm">Paper Size</p>
                            <p class="font-semibold">{{ selectedOrder.printOptions.paperSize }}</p>
                        </div>
                        <div class="bg-green-50 p-3 rounded">
                            <p class="text-gray-600 text-sm">Color Mode</p>
                            <p class="font-semibold">{{ selectedOrder.printOptions.colorMode }}</p>
                        </div>
                        <div class="bg-purple-50 p-3 rounded">
                            <p class="text-gray-600 text-sm">Paper Type</p>
                            <p class="font-semibold capitalize">{{ selectedOrder.printOptions.paperType }}</p>
                        </div>
                        <div class="bg-orange-50 p-3 rounded">
                            <p class="text-gray-600 text-sm">Pages</p>
                            <p class="font-semibold">{{ selectedOrder.printOptions.pages }}</p>
                        </div>
                        <div class="bg-red-50 p-3 rounded">
                            <p class="text-gray-600 text-sm">Copies</p>
                            <p class="font-semibold">{{ selectedOrder.printOptions.copies }}</p>
                        </div>
                        <div class="bg-indigo-50 p-3 rounded">
                            <p class="text-gray-600 text-sm">Total Pages</p>
                            <p class="font-semibold">{{ selectedOrder.printOptions.pages * selectedOrder.printOptions.copies }}</p>
                        </div>
                    </div>
                    <div *ngIf="selectedOrder.printOptions.pickupDateTime" class="mt-3">
                        <p class="text-gray-600 text-sm">Pickup Date & Time</p>
                        <p class="font-semibold">{{ selectedOrder.printOptions.pickupDateTime | date: 'MMM dd, yyyy HH:mm' }}</p>
                    </div>
                    <div *ngIf="selectedOrder.printOptions.note" class="mt-3">
                        <p class="text-gray-600 text-sm">Notes</p>
                        <p class="font-semibold bg-gray-50 p-2 rounded">{{ selectedOrder.printOptions.note }}</p>
                    </div>
                </div>

                <p-divider></p-divider>

                <div>
                    <h3 class="font-semibold mb-2">Payment Details</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <p class="text-gray-600 text-sm">Method</p>
                            <p class="font-semibold capitalize">{{ selectedOrder.payment.paymentMethod }}</p>
                        </div>
                        <div>
                            <p class="text-gray-600 text-sm">Status</p>
                            <p-tag value="PAID" severity="success"></p-tag>
                        </div>
                    </div>
                    <div class="mt-3">
                        <p class="text-gray-600 text-sm">Total Amount</p>
                        <p class="font-bold text-xl text-primary-600">₱{{ selectedOrder.totalAmount | number: '1.2-2' }}</p>
                    </div>
                    <div *ngIf="selectedOrder.payment.referenceNo" class="mt-2">
                        <p class="text-gray-600 text-sm">Reference No.</p>
                        <p class="font-semibold text-sm">{{ selectedOrder.payment.referenceNo }}</p>
                    </div>
                </div>

                <p-divider></p-divider>

                <div>
                    <h3 class="font-semibold mb-2">Order Status</h3>
                    <p-tag [value]="getStatusLabel(selectedOrder.status)" [severity]="getStatusSeverity(selectedOrder.status)" class="text-sm"> </p-tag>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <p-button label="Close" icon="pi pi-times" (click)="showModal = false" severity="secondary"></p-button>
            </ng-template>
        </p-dialog>
    `
})
export class AdminVerifiedPaymentsComponent {
    private ordersService = inject(OrdersService);
    private cdr = inject(ChangeDetectorRef);
    private firestore = inject(Firestore);

    orders: Order[] = [];
    selectedOrder: Order | null = null;
    showModal = false;
    customerNames: Record<string, string> = {};

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.ordersService.getAllOrders().subscribe({
            next: (orders) => {
                // Filter orders with paid payment status
                const paidOrders = orders.filter((order) => order.payment?.status === 'paid');

                this.orders = paidOrders
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
                console.error('Failed to load verified payment orders', err);
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

    openModal(order: Order) {
        this.selectedOrder = order;
        this.showModal = true;
        this.cdr.markForCheck();
    }

    getCustomerName(uid: string): string {
        return this.customerNames[uid] || uid;
    }

    getStatusLabel(status: string): string {
        switch (status) {
            case 'pending':
                return 'Pending';
            case 'processing':
                return 'In Progress';
            case 'completed':
                return 'Ready to Pick Up';
            default:
                return status;
        }
    }

    getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
        switch (status) {
            case 'completed':
                return 'success';
            case 'processing':
                return 'info';
            case 'pending':
                return 'warn';
            default:
                return 'secondary';
        }
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
