import { Component, ChangeDetectionStrategy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '@/app/services/orders.service';
import { Order, OrderStatus } from '@/app/models';
import { PaymentStatus } from '@/app/models';
import { Firestore, collection, getDocs } from '@angular/fire/firestore';
import { from, map } from 'rxjs';

@Component({
    selector: 'app-admin-orders',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, InputTextModule, TagModule, CardModule, TooltipModule, FormsModule, DialogModule, DividerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="card">
            <p-card header="All Orders" styleClass="mb-0">
                <div class="mb-4 flex gap-2">
                    <input pInputText type="text" placeholder="Search by Order ID, User ID or Status" [(ngModel)]="searchValue" (input)="filterOrders()" class="flex-1" />
                </div>

                <p-table [value]="filteredOrders" [rows]="10" [paginator]="true" responsiveLayout="scroll" [globalFilterFields]="['orderId', 'status']" styleClass="p-datatable-striped">
                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="orderId">Order ID <p-sortIcon field="orderId"></p-sortIcon></th>
                            <th>Customer</th>
                            <th pSortableColumn="createdAt">Date <p-sortIcon field="createdAt"></p-sortIcon></th>
                            <th>Total</th>
                            <th pSortableColumn="status">Status <p-sortIcon field="status"></p-sortIcon></th>
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
                                <p-tag [value]="order.status" [severity]="getStatusSeverity(order.status)"></p-tag>
                            </td>
                            <td>
                                <p-button icon="pi pi-eye" [rounded]="true" [text]="true" (click)="openModal(order)" pTooltip="View" tooltipPosition="top"></p-button>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="6" class="text-center py-4">
                                <p class="text-muted-color">No orders found.</p>
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
                        <p class="text-sm text-gray-600">User ID</p>
                        <p class="font-mono text-sm">{{ selectedOrder.userId }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-tag [value]="selectedOrder.status | uppercase" [severity]="getStatusSeverity(selectedOrder.status)"></p-tag>
                        <select [(ngModel)]="selectedStatus" class="p-inputtext p-component" style="min-width: 12rem">
                            <option *ngFor="let opt of statusOptions" [ngValue]="opt.value">{{ opt.label }}</option>
                        </select>
                        <p-button label="Save" icon="pi pi-check" size="small" (click)="updateStatus()" [loading]="saving"></p-button>
                    </div>
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

                <div *ngIf="selectedOrder.documents && selectedOrder.documents.length > 0">
                    <h3 class="font-semibold mb-3">Uploaded Documents</h3>
                    <div class="space-y-2">
                        <div *ngFor="let doc of selectedOrder.documents" class="flex items-center justify-between bg-gray-50 p-3 rounded">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-file text-lg text-blue-500"></i>
                                <div>
                                    <p class="font-semibold text-sm">{{ doc.fileName }}</p>
                                    <p class="text-xs text-gray-600">{{ formatFileSize(doc.fileSize) }} • {{ doc.uploadedAt | date: 'MMM dd, yyyy' }}</p>
                                </div>
                            </div>
                            <div class="flex gap-2">
                                <p-button icon="pi pi-eye" [text]="true" [rounded]="true" (click)="viewFile(doc)" pTooltip="View File" tooltipPosition="left"></p-button>
                                <p-button icon="pi pi-download" [text]="true" [rounded]="true" (click)="downloadFile(doc)" pTooltip="Download" tooltipPosition="left"></p-button>
                            </div>
                        </div>
                    </div>
                </div>

                <p-divider></p-divider>

                <div>
                    <h3 class="font-semibold mb-2">Payment</h3>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <p class="text-gray-600 text-sm">Method</p>
                            <p class="font-semibold capitalize">{{ selectedOrder.payment.paymentMethod }}</p>
                        </div>
                        <div>
                            <p class="text-gray-600 text-sm">Status</p>
                            <div class="flex items-center gap-2">
                                <p-tag [value]="selectedOrder.payment.status | uppercase" [severity]="getPaymentStatusSeverity(selectedOrder.payment.status)"></p-tag>
                                <select [(ngModel)]="selectedPaymentStatus" class="p-inputtext p-component" style="min-width: 10rem">
                                    <option *ngFor="let opt of paymentStatusOptions" [ngValue]="opt.value">{{ opt.label }}</option>
                                </select>
                                <p-button label="Save" icon="pi pi-check" size="small" (click)="updatePaymentStatus()" [loading]="paymentSaving"></p-button>
                            </div>
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

                <div *ngIf="selectedOrder.documents.length">
                    <p-divider></p-divider>
                    <h3 class="font-semibold mb-2">Documents</h3>
                    <div class="space-y-2">
                        <div *ngFor="let doc of selectedOrder.documents" class="flex items-center justify-between bg-gray-50 p-3 rounded">
                            <div>
                                <p class="font-semibold text-sm">{{ doc.fileName }}</p>
                                <p class="text-xs text-gray-600">{{ doc.uploadedAt | date: 'MMM dd, yyyy' }} — {{ formatFileSize(doc.fileSize) }}</p>
                            </div>
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
export class AdminOrdersComponent {
    private ordersService = inject(OrdersService);
    private cdr = inject(ChangeDetectorRef);
    private firestore = inject(Firestore);

    orders: Order[] = [];
    filteredOrders: Order[] = [];
    searchValue = '';
    showModal = false;
    selectedOrder: Order | null = null;
    selectedStatus: OrderStatus | null = null;
    selectedPaymentStatus: PaymentStatus | null = null;
    saving = false;
    paymentSaving = false;
    customerNames: Record<string, string> = {};
    statusOptions = [
        { label: 'Pending', value: 'pending' as OrderStatus },
        { label: 'Processing', value: 'processing' as OrderStatus },
        { label: 'Ready to Pick Up', value: 'completed' as OrderStatus }
    ];
    paymentStatusOptions = [
        { label: 'Pending', value: 'pending' as PaymentStatus },
        { label: 'Unpaid', value: 'unpaid' as PaymentStatus },
        { label: 'Paid', value: 'paid' as PaymentStatus }
    ];

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.ordersService.getAllOrders().subscribe({
            next: (orders) => {
                this.orders = orders.map((o) => this.normalizeOrder(o));
                this.filterOrders();
                this.loadCustomerNames();
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load admin orders', err);
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

    filterOrders() {
        const search = this.searchValue.trim().toLowerCase();
        if (!search) {
            this.filteredOrders = this.orders;
            this.cdr.markForCheck();
            return;
        }
        this.filteredOrders = this.orders.filter((o) => o.orderId.toLowerCase().includes(search) || o.userId?.toLowerCase().includes(search) || o.status.toLowerCase().includes(search));
        this.cdr.markForCheck();
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
            },
            documents: (order.documents || []).map((d) => ({
                ...d,
                uploadedAt: toDate(d.uploadedAt) as Date
            }))
        } as Order;
    }

    openModal(order: Order) {
        this.selectedOrder = order;
        this.selectedStatus = order.status;
        this.selectedPaymentStatus = order.payment.status;
        this.showModal = true;
        this.cdr.markForCheck();
    }
    updateStatus() {
        if (!this.selectedOrder || !this.selectedStatus || this.selectedStatus === this.selectedOrder.status) {
            return;
        }
        this.saving = true;
        const orderId = this.selectedOrder.orderId;
        const newStatus = this.selectedStatus;
        this.ordersService.updateOrderStatus(orderId, newStatus).subscribe({
            next: () => {
                // update local state
                this.selectedOrder = { ...this.selectedOrder!, status: newStatus, updatedAt: new Date() } as Order;
                this.orders = this.orders.map((o) => (o.orderId === orderId ? { ...o, status: newStatus, updatedAt: new Date() } : o));
                this.filterOrders();
                this.saving = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to update status', err);
                this.saving = false;
                this.cdr.markForCheck();
            }
        });
    }

    updatePaymentStatus() {
        if (!this.selectedOrder || !this.selectedPaymentStatus || this.selectedPaymentStatus === this.selectedOrder.payment.status) {
            return;
        }
        this.paymentSaving = true;
        const orderId = this.selectedOrder.orderId;
        const newStatus = this.selectedPaymentStatus;
        const updatedPayment = { ...this.selectedOrder.payment, status: newStatus };

        this.ordersService.updateOrder(orderId, { payment: updatedPayment }).subscribe({
            next: () => {
                this.selectedOrder = { ...this.selectedOrder!, payment: updatedPayment, updatedAt: new Date() } as Order;
                this.orders = this.orders.map((o) => (o.orderId === orderId ? { ...o, payment: updatedPayment, updatedAt: new Date() } : o));
                this.filterOrders();
                this.paymentSaving = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to update payment status', err);
                this.paymentSaving = false;
                this.cdr.markForCheck();
            }
        });
    }

    getCustomerName(uid: string): string {
        return this.customerNames[uid] || uid;
    }

    formatFileSize(bytes: number): string {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    getPaymentStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
        switch (status) {
            case 'paid':
                return 'success';
            case 'pending':
                return 'warn';
            case 'unpaid':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    getStatusSeverity(status: OrderStatus): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
        switch (status) {
            case 'pending':
                return 'warn';
            case 'processing':
                return 'info';
            case 'ready':
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    viewFile(doc: any) {
        console.log('[AdminOrders] viewFile called with doc:', doc);
        console.log('[AdminOrders] doc.fileData exists:', !!doc.fileData);

        if (!doc.fileData) {
            console.error('[AdminOrders] No fileData found in doc. Available keys:', Object.keys(doc));
            alert('File data not available');
            return;
        }

        try {
            console.log('[AdminOrders] Opening file:', doc.fileName);

            // Convert Base64 data URL to Blob
            const byteString = atob(doc.fileData.split(',')[1]);
            const mimeType = doc.fileData.split(';')[0].split(':')[1];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);

            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            const blob = new Blob([ab], { type: mimeType });
            const blobUrl = URL.createObjectURL(blob);

            console.log('[AdminOrders] Created blob URL, opening in new tab');
            window.open(blobUrl, '_blank');

            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 100);
        } catch (error) {
            console.error('[AdminOrders] Error viewing file:', error);
            alert('Error opening file');
        }
    }

    downloadFile(doc: any) {
        console.log('[AdminOrders] downloadFile called with doc:', doc);
        console.log('[AdminOrders] doc.fileData exists:', !!doc.fileData);

        if (!doc.fileData) {
            console.error('[AdminOrders] No fileData found in doc');
            alert('File data not available');
            return;
        }

        try {
            console.log('[AdminOrders] Downloading Base64 file:', doc.fileName);

            // Convert Base64 data URL to Blob
            const byteString = atob(doc.fileData.split(',')[1]);
            const mimeType = doc.fileData.split(';')[0].split(':')[1];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);

            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            const blob = new Blob([ab], { type: mimeType });
            const blobUrl = URL.createObjectURL(blob);

            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = doc.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Clean up
            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('[AdminOrders] Error downloading file:', error);
            alert('Error downloading file');
        }
    }
}
