import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { OrdersService } from '@/app/services/orders.service';
import { Order, OrderStatus } from '@/app/models';
import { UserService } from '@/app/services/user.service';
import { filter, take } from 'rxjs';
import { User } from '@/app/models/user.model';

@Component({
    selector: 'app-orders-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, InputTextModule, TagModule, CardModule, FormsModule, TooltipModule, DialogModule, DividerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="card">
            <p-card header="My Orders" styleClass="mb-0">
                <div class="mb-4 flex gap-2">
                    <input pInputText type="text" placeholder="Search orders..." [(ngModel)]="searchValue" (input)="filterOrders()" class="flex-1" />
                    <p-button label="Create Order" icon="pi pi-plus" routerLink="/pages/orders/new"></p-button>
                </div>

                <p-table [value]="filteredOrders" [rows]="10" [paginator]="true" responsiveLayout="scroll" [globalFilterFields]="['orderId', 'status']" styleClass="p-datatable-striped">
                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="orderId">Order ID <p-sortIcon field="orderId"></p-sortIcon></th>
                            <th pSortableColumn="createdAt">Date <p-sortIcon field="createdAt"></p-sortIcon></th>
                            <th>Items</th>
                            <th>Files</th>
                            <th>Total</th>
                            <th pSortableColumn="status">Status <p-sortIcon field="status"></p-sortIcon></th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-order>
                        <tr>
                            <td class="font-semibold">{{ order.orderId }}</td>
                            <td>{{ order.createdAt | date: 'MMM dd, yyyy HH:mm' }}</td>
                            <td>
                                <span class="text-sm"> {{ order.printOptions.pages }} page(s) × {{ order.printOptions.copies }} copies </span>
                            </td>
                            <td>
                                <span *ngIf="order.documents && order.documents.length > 0" class="text-sm font-semibold text-blue-600"> {{ order.documents.length }} file(s) </span>
                                <span *ngIf="!order.documents || order.documents.length === 0" class="text-sm text-gray-400"> - </span>
                            </td>
                            <td class="font-semibold">₱{{ order.totalAmount | number: '1.2-2' }}</td>
                            <td>
                                <p-tag [value]="displayStatus(order.status)" [severity]="getStatusSeverity(order.status)"></p-tag>
                            </td>
                            <td>
                                <p-button icon="pi pi-eye" [rounded]="true" [text]="true" (click)="viewOrder(order)" pTooltip="View Details" tooltipPosition="top"></p-button>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="7" class="text-center py-4">
                                <p class="text-muted-color">No orders found. <a routerLink="/pages/orders/new" class="text-primary font-semibold">Create one now!</a></p>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        </div>

        <!-- Order Details Modal -->
        <p-dialog [(visible)]="showModal" [header]="selectedOrder?.orderId" [modal]="true" [style]="{ width: '50vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <div *ngIf="selectedOrder" class="space-y-4">
                <!-- Status -->
                <div>
                    <label class="font-semibold text-gray-600">Status</label>
                    <p-tag [value]="displayStatus(selectedOrder.status) | uppercase" [severity]="getStatusSeverity(selectedOrder.status)" class="mt-2"></p-tag>
                </div>

                <p-divider></p-divider>

                <!-- Dates -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="font-semibold text-gray-600 text-sm">Order Date</label>
                        <p class="font-semibold mt-1">{{ selectedOrder.createdAt | date: 'MMM dd, yyyy HH:mm' }}</p>
                    </div>
                    <div>
                        <label class="font-semibold text-gray-600 text-sm">Last Updated</label>
                        <p class="font-semibold mt-1">{{ selectedOrder.updatedAt | date: 'MMM dd, yyyy HH:mm' }}</p>
                    </div>
                </div>

                <p-divider></p-divider>

                <!-- Print Options -->
                <div>
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

                <!-- Payment Info -->
                <div>
                    <h3 class="font-semibold mb-3">Payment Information</h3>
                    <div class="bg-blue-50 p-4 rounded mb-3">
                        <p class="text-gray-600 text-sm">Total Amount</p>
                        <p class="font-bold text-2xl text-primary-600">₱{{ selectedOrder.totalAmount | number: '1.2-2' }}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <p class="text-gray-600 text-sm">Payment Method</p>
                            <p class="font-semibold capitalize">{{ selectedOrder.payment.paymentMethod }}</p>
                        </div>
                        <div>
                            <p class="text-gray-600 text-sm">Payment Status</p>
                            <p-tag [value]="selectedOrder.payment.status | uppercase" [severity]="getPaymentStatusSeverity(selectedOrder.payment.status)" class="mt-1"></p-tag>
                        </div>
                    </div>
                    <div *ngIf="selectedOrder.payment.referenceNo" class="mt-3">
                        <p class="text-gray-600 text-sm">Reference Number</p>
                        <p class="font-semibold bg-gray-50 p-2 rounded text-sm">{{ selectedOrder.payment.referenceNo }}</p>
                    </div>
                </div>

                <!-- Documents -->
                <div *ngIf="selectedOrder.documents && selectedOrder.documents.length > 0">
                    <p-divider></p-divider>
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
            </div>

            <ng-template pTemplate="footer">
                <p-button label="Close" icon="pi pi-times" (click)="showModal = false" severity="secondary"></p-button>
            </ng-template>
        </p-dialog>
    `
})
export class OrdersListComponent implements OnInit {
    ordersService = inject(OrdersService);
    userService = inject(UserService);
    cdr = inject(ChangeDetectorRef);
    orders: Order[] = [];
    filteredOrders: Order[] = [];
    searchValue: string = '';
    showModal = false;
    selectedOrder: Order | null = null;

    ngOnInit() {
        this.loadOrders();
    }

    loadOrders() {
        this.userService
            .getCurrentUserData()
            .pipe(
                filter((u): u is User => !!u),
                take(1)
            )
            .subscribe((user) => {
                const source$ = user.role === 'admin' ? this.ordersService.getAllOrders() : this.ordersService.getUserOrders(user.uid);

                source$.subscribe({
                    next: (orders: Order[]) => {
                        const filtered = user.role === 'admin' ? orders : orders.filter((o: Order) => o.userId === user.uid);
                        if (user.role === 'admin') {
                            console.log('[OrdersList] Admin orders:', filtered);
                        } else {
                            console.log('[OrdersList] Customer orders:', filtered);
                        }
                        // Log documents with fileData
                        filtered.forEach((order, idx) => {
                            console.log(`[OrdersList] Order ${idx} documents:`, order.documents);
                            if (order.documents) {
                                order.documents.forEach((doc, docIdx) => {
                                    console.log(`  Doc ${docIdx}: fileName=${doc.fileName}, hasFileData=${!!doc.fileData}`);
                                });
                            }
                        });
                        this.orders = filtered;
                        this.filterOrders();
                        this.cdr.markForCheck();
                    },
                    error: (err) => {
                        console.error('Failed to load orders', err);
                    }
                });
            });
    }

    filterOrders() {
        if (!this.searchValue.trim()) {
            this.filteredOrders = this.orders;
        } else {
            const search = this.searchValue.toLowerCase();
            this.filteredOrders = this.orders.filter((o) => o.orderId.toLowerCase().includes(search) || o.status.toLowerCase().includes(search));
        }
        this.cdr.markForCheck();
    }

    viewOrder(order: Order) {
        this.selectedOrder = order;
        this.showModal = true;
        this.cdr.markForCheck();
    }

    displayStatus(status: OrderStatus): string {
        return status === 'completed' ? 'Ready to Pick Up' : status;
    }

    formatColorMode(mode: string): string {
        return mode === 'bw' ? 'Black & White' : 'Color';
    }

    formatFileSize(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    viewFile(doc: any) {
        console.log('[OrdersList] viewFile called with doc:', doc);
        console.log('[OrdersList] doc.fileData exists:', !!doc.fileData);

        if (!doc.fileData) {
            console.error('[OrdersList] No fileData found in doc. Available keys:', Object.keys(doc));
            alert('File data not available');
            return;
        }

        try {
            console.log('[OrdersList] Opening file:', doc.fileName);

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

            console.log('[OrdersList] Created blob URL, opening in new tab');
            window.open(blobUrl, '_blank');

            // Clean up after a delay to allow the window to open
            setTimeout(() => {
                URL.revokeObjectURL(blobUrl);
            }, 100);
        } catch (error) {
            console.error('[OrdersList] Error viewing file:', error);
            alert('Error opening file');
        }
    }

    downloadFile(doc: any) {
        console.log('[OrdersList] downloadFile called with doc:', doc);
        console.log('[OrdersList] doc.fileData exists:', !!doc.fileData);

        if (!doc.fileData) {
            console.error('[OrdersList] No fileData found in doc');
            alert('File data not available');
            return;
        }

        try {
            console.log('[OrdersList] Downloading Base64 file:', doc.fileName);

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
            console.error('[OrdersList] Error downloading file:', error);
            alert('Error downloading file');
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

    getStatusSeverity(status: OrderStatus): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
        switch (status) {
            case 'pending':
                return 'warn';
            case 'processing':
                return 'info';
            case 'ready':
                return 'success';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
    }
}
