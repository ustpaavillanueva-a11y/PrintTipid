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
    selector: 'app-admin-today-orders',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, TagModule, CardModule, TooltipModule, DialogModule, DividerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="card">
            <h2 class="text-2xl font-bold mb-6">Today's Orders</h2>

            <div *ngIf="orders.length === 0" class="text-center py-8">
                <p class="text-gray-500 text-lg">No orders placed today.</p>
            </div>

            <div *ngIf="orders.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div *ngFor="let order of orders" class="order-card border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-200">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <p class="text-xs text-gray-500 uppercase tracking-wide">Order ID</p>
                            <p class="text-lg font-bold text-gray-800">{{ order.orderId }}</p>
                        </div>
                        <p-tag [value]="getStatusLabel(order.status)" [severity]="getStatusSeverity(order.status)" class="text-xs"> </p-tag>
                    </div>

                    <div class="border-t border-gray-100 pt-3 mb-3">
                        <p class="text-xs text-gray-500 mb-1">Customer</p>
                        <p class="font-semibold text-gray-800">{{ getCustomerName(order.userId) }}</p>
                    </div>

                    <div class="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <p class="text-xs text-gray-500 mb-1">Time</p>
                            <p class="font-semibold text-gray-800">{{ order.createdAt | date: 'HH:mm' }}</p>
                        </div>
                        <div>
                            <p class="text-xs text-gray-500 mb-1">Total Amount</p>
                            <p class="font-bold text-lg text-primary-600">₱{{ order.totalAmount | number: '1.2-2' }}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-3 gap-2 mb-3 text-center text-xs">
                        <div class="bg-blue-50 p-2 rounded">
                            <p class="text-gray-600">{{ order.printOptions.pages }}</p>
                            <p class="text-gray-500 text-xs">Pages</p>
                        </div>
                        <div class="bg-green-50 p-2 rounded">
                            <p class="text-gray-600">{{ order.printOptions.copies }}</p>
                            <p class="text-gray-500 text-xs">Copies</p>
                        </div>
                        <div class="bg-purple-50 p-2 rounded">
                            <p class="text-gray-600">{{ order.printOptions.colorMode }}</p>
                            <p class="text-gray-500 text-xs">Color</p>
                        </div>
                    </div>

                    <div class="border-t border-gray-100 pt-3">
                        <p class="text-xs text-gray-500 mb-2">Payment Status</p>
                        <div class="flex justify-between items-center">
                            <p-tag [value]="order.payment.status | uppercase" [severity]="getPaymentStatusSeverity(order.payment.status)"></p-tag>
                            <p-button icon="pi pi-eye" [rounded]="true" [text]="true" (click)="openModal(order)" pTooltip="View Details" tooltipPosition="top"> </p-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <p-dialog [(visible)]="showModal" [header]="selectedOrder?.orderId" [modal]="true" [style]="{ width: '50vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <div *ngIf="selectedOrder" class="space-y-4">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm text-gray-600">Customer</p>
                        <p class="font-semibold">{{ getCustomerName(selectedOrder.userId) }}</p>
                    </div>
                    <p-tag [value]="getStatusLabel(selectedOrder.status)" [severity]="getStatusSeverity(selectedOrder.status)"> </p-tag>
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
    `,
    styles: [
        `
            :host ::ng-deep {
                .card {
                    border-radius: 8px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    padding: 1.5rem;
                }

                h2 {
                    color: #1f2937;
                }

                .order-card {
                    background: #fff;
                    transition: all 0.2s ease;

                    &:hover {
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        transform: translateY(-2px);
                    }
                }

                .text-2xl {
                    font-size: 1.5rem;
                }

                .text-xl {
                    font-size: 1.25rem;
                }

                .text-lg {
                    font-size: 1.125rem;
                }

                .text-sm {
                    font-size: 0.875rem;
                }

                .text-xs {
                    font-size: 0.75rem;
                }

                .font-bold {
                    font-weight: 700;
                }

                .font-semibold {
                    font-weight: 600;
                }

                .mb-6 {
                    margin-bottom: 1.5rem;
                }
                .mb-3 {
                    margin-bottom: 0.75rem;
                }
                .mb-2 {
                    margin-bottom: 0.5rem;
                }
                .mb-1 {
                    margin-bottom: 0.25rem;
                }

                .mt-3 {
                    margin-top: 0.75rem;
                }
                .mt-2 {
                    margin-top: 0.5rem;
                }

                .pt-3 {
                    padding-top: 0.75rem;
                }
                .p-2 {
                    padding: 0.5rem;
                }
                .p-3 {
                    padding: 0.75rem;
                }
                .p-4 {
                    padding: 1rem;
                }

                .py-8 {
                    padding: 2rem 0;
                }

                .text-gray-500 {
                    color: #6b7280;
                }
                .text-gray-600 {
                    color: #4b5563;
                }
                .text-gray-800 {
                    color: #1f2937;
                }

                .text-primary-600 {
                    color: var(--primary-600, #2563eb);
                }

                .bg-blue-50 {
                    background-color: #eff6ff;
                }
                .bg-green-50 {
                    background-color: #f0fdf4;
                }
                .bg-purple-50 {
                    background-color: #faf5ff;
                }
                .bg-orange-50 {
                    background-color: #fff7ed;
                }
                .bg-red-50 {
                    background-color: #fef2f2;
                }
                .bg-indigo-50 {
                    background-color: #eef2ff;
                }
                .bg-gray-50 {
                    background-color: #f9fafb;
                }

                .border {
                    border: 1px solid #e5e7eb;
                }

                .border-t {
                    border-top: 1px solid #e5e7eb;
                }

                .border-gray-100 {
                    border-color: #f3f4f6;
                }

                .border-gray-200 {
                    border-color: #e5e7eb;
                }

                .rounded {
                    border-radius: 0.375rem;
                }

                .rounded-lg {
                    border-radius: 0.5rem;
                }

                .grid {
                    display: grid;
                }

                .grid-cols-1 {
                    grid-template-columns: repeat(1, minmax(0, 1fr));
                }
                .grid-cols-2 {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
                .grid-cols-3 {
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                }

                .gap-2 {
                    gap: 0.5rem;
                }
                .gap-3 {
                    gap: 0.75rem;
                }
                .gap-4 {
                    gap: 1rem;
                }

                .flex {
                    display: flex;
                }

                .justify-between {
                    justify-content: space-between;
                }

                .items-center {
                    align-items: center;
                }

                .items-start {
                    align-items: flex-start;
                }

                .uppercase {
                    text-transform: uppercase;
                }

                .capitalize {
                    text-transform: capitalize;
                }

                .tracking-wide {
                    letter-spacing: 0.05em;
                }

                .hover\\:shadow-lg:hover {
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }

                .transition-shadow {
                    transition-property: box-shadow;
                    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                    transition-duration: 200ms;
                }

                @media (min-width: 768px) {
                    .md\\:grid-cols-2 {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }

                    .md\\:grid-cols-3 {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                }

                @media (min-width: 1024px) {
                    .lg\\:grid-cols-3 {
                        grid-template-columns: repeat(3, minmax(0, 1fr));
                    }
                }
            }
        `
    ]
})
export class AdminTodayOrdersComponent {
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
        this.ordersService.getAllOrders().subscribe({
            next: (orders) => {
                // Filter to only today's orders
                const today = this.getStartOfDay(new Date());
                const todayEnd = this.getEndOfDay(new Date());

                const filteredOrders = orders.filter((order) => {
                    const orderDate = this.getOrderDate(order.createdAt);
                    return orderDate >= today && orderDate <= todayEnd;
                });

                this.orders = filteredOrders
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
                console.error('Failed to load today orders', err);
                this.cdr.markForCheck();
            }
        });
    }

    private getStartOfDay(date: Date): Date {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        return start;
    }

    private getEndOfDay(date: Date): Date {
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);
        return end;
    }

    private getOrderDate(createdAt: any): Date {
        if (createdAt?.toDate) {
            return createdAt.toDate();
        }
        if (createdAt instanceof Date) {
            return createdAt;
        }
        return createdAt ? new Date(createdAt) : new Date();
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
            console.error('[AdminTodayOrders] No fileData found in doc. Available keys:', Object.keys(doc));
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

            // Clean up after a delay to allow the window to open
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 100);
        } catch (error) {
            console.error('[AdminTodayOrders] Error viewing file:', error);
            alert('Error opening file');
        }
    }

    downloadFile(doc: any) {

        if (!doc.fileData) {
            console.error('[AdminTodayOrders] No fileData found in doc');
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
            console.error('[AdminTodayOrders] Error downloading file:', error);
            alert('Error downloading file');
        }
    }
}
