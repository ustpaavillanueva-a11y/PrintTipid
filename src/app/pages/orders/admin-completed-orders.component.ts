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
    selector: 'app-admin-completed-orders',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, TagModule, CardModule, TooltipModule, DialogModule, DividerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="card">
            <p-card header="Completed Orders" styleClass="mb-0">
                <p-table [value]="orders" [rows]="10" [paginator]="true" responsiveLayout="scroll" styleClass="p-datatable-striped">
                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="orderId">Order ID <p-sortIcon field="orderId"></p-sortIcon></th>
                            <th>Customer</th>
                            <th pSortableColumn="createdAt">Date <p-sortIcon field="createdAt"></p-sortIcon></th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-order>
                        <tr>
                            <td class="font-semibold">{{ order.orderId }}</td>
                            <td>{{ getCustomerName(order.userId) }}</td>
                            <td>{{ order.createdAt | date: 'MMM dd, yyyy HH:mm' }}</td>
                            <td class="font-semibold">₱{{ order.totalAmount | number: '1.2-2' }}</td>
                            <td><p-tag value="Ready to Pick Up" severity="success"></p-tag></td>
                            <td>
                                <p-button icon="pi pi-eye" [rounded]="true" [text]="true" (click)="openModal(order)" pTooltip="View" tooltipPosition="top"></p-button>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="6" class="text-center py-4">
                                <p class="text-muted-color">No completed orders found.</p>
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
                    <p-tag value="Ready to Pick Up" severity="success"></p-tag>
                </div>

                <p-divider></p-divider>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600">Order Date</p>
                        <p class="font-semibold">{{ selectedOrder.createdAt | date: 'MMM dd, yyyy HH:mm' }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Completed Date</p>
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
                            <p-tag [value]="selectedOrder.payment.status | uppercase" [severity]="getPaymentStatusSeverity(selectedOrder.payment.status)"></p-tag>
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
            </div>

            <ng-template pTemplate="footer">
                <p-button label="Close" icon="pi pi-times" (click)="showModal = false" severity="secondary"></p-button>
            </ng-template>
        </p-dialog>
    `
})
export class AdminCompletedOrdersComponent {
    private ordersService = inject(OrdersService);
    private cdr = inject(ChangeDetectorRef);
    private firestore = inject(Firestore);

    orders: Order[] = [];
    showModal = false;
    selectedOrder: Order | null = null;
    customerNames: Record<string, string> = {};

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.ordersService.getOrdersByStatus('completed').subscribe({
            next: (orders) => {
                this.orders = orders.map((o) => this.normalizeOrder(o));
                this.loadCustomerNames();
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load completed orders', err);
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

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    viewFile(doc: any) {

        if (!doc.fileData) {
            console.error('[AdminCompletedOrders] No fileData found in doc. Available keys:', Object.keys(doc));
            alert('File data not available');
            return;
        }

        try {

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

            window.open(blobUrl, '_blank');

            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 100);
        } catch (error) {
            console.error('[AdminCompletedOrders] Error viewing file:', error);
            alert('Error opening file');
        }
    }

    downloadFile(doc: any) {
      

        if (!doc.fileData) {
            console.error('[AdminCompletedOrders] No fileData found in doc');
            alert('File data not available');
            return;
        }

        try {

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
            console.error('[AdminCompletedOrders] Error downloading file:', error);
            alert('Error downloading file');
        }
    }
}
