import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { OrdersService } from '../../services/orders.service';
import { Order, OrderStatus, PaymentStatus } from '../../models/order.model';

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, CardModule, ButtonModule, TagModule, DividerModule, ToastModule],
    providers: [MessageService],
    template: `
        <div class="container mx-auto px-4 py-8">
            <div class="mb-4 flex items-center gap-4">
                <p-button icon="pi pi-arrow-left" [text]="true" (click)="goBack()" pTooltip="Back to Orders" tooltipPosition="right"></p-button>
                <h1 class="text-3xl font-bold">Order Details</h1>
            </div>

            <div *ngIf="isLoading" class="text-center py-12">
                <svg class="animate-spin h-12 w-12 mx-auto text-primary-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p class="mt-4 text-gray-600">Loading order details...</p>
            </div>

            <div *ngIf="!isLoading && order" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Main Order Info -->
                <div class="lg:col-span-2 space-y-6">
                    <!-- Order Header -->
                    <p-card class="shadow-lg">
                        <ng-template pTemplate="header">
                            <div class="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 text-white">
                                <h2 class="text-2xl font-bold">{{ order.orderId }}</h2>
                            </div>
                        </ng-template>
                        <div class="space-y-4">
                            <div class="flex items-center justify-between">
                                <span class="text-gray-600">Status</span>
                                <p-tag [value]="order.status | uppercase" [severity]="getStatusSeverity(order.status)"></p-tag>
                            </div>
                            <p-divider></p-divider>
                            <div class="flex items-center justify-between">
                                <span class="text-gray-600">Order Date</span>
                                <span class="font-semibold">{{ order.createdAt | date: 'MMM dd, yyyy HH:mm' }}</span>
                            </div>
                            <div class="flex items-center justify-between">
                                <span class="text-gray-600">Last Updated</span>
                                <span class="font-semibold">{{ order.updatedAt | date: 'MMM dd, yyyy HH:mm' }}</span>
                            </div>
                        </div>
                    </p-card>

                    <!-- Print Options -->
                    <p-card header="Print Options" class="shadow-lg">
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div class="bg-blue-50 p-4 rounded-lg">
                                <p class="text-gray-600 text-sm">Paper Size</p>
                                <p class="font-semibold text-lg">{{ order.printOptions.paperSize }}</p>
                            </div>
                            <div class="bg-green-50 p-4 rounded-lg">
                                <p class="text-gray-600 text-sm">Color Mode</p>
                                <p class="font-semibold text-lg">{{ formatColorMode(order.printOptions.colorMode) }}</p>
                            </div>
                            <div class="bg-purple-50 p-4 rounded-lg">
                                <p class="text-gray-600 text-sm">Paper Type</p>
                                <p class="font-semibold text-lg capitalize">{{ order.printOptions.paperType }}</p>
                            </div>
                            <div class="bg-orange-50 p-4 rounded-lg">
                                <p class="text-gray-600 text-sm">Pages</p>
                                <p class="font-semibold text-lg">{{ order.printOptions.pages }}</p>
                            </div>
                            <div class="bg-red-50 p-4 rounded-lg">
                                <p class="text-gray-600 text-sm">Copies</p>
                                <p class="font-semibold text-lg">{{ order.printOptions.copies }}</p>
                            </div>
                            <div class="bg-indigo-50 p-4 rounded-lg">
                                <p class="text-gray-600 text-sm">Total Pages</p>
                                <p class="font-semibold text-lg">{{ order.printOptions.pages * order.printOptions.copies }}</p>
                            </div>
                        </div>
                        <p-divider></p-divider>
                        <div *ngIf="order.printOptions.pickupDateTime" class="mt-4">
                            <p class="text-gray-600 text-sm mb-2">Pickup Date & Time</p>
                            <p class="font-semibold">{{ order.printOptions.pickupDateTime | date: 'MMM dd, yyyy HH:mm' }}</p>
                        </div>
                        <div *ngIf="order.printOptions.note" class="mt-4">
                            <p class="text-gray-600 text-sm mb-2">Notes</p>
                            <p class="font-semibold bg-gray-50 p-3 rounded">{{ order.printOptions.note }}</p>
                        </div>
                    </p-card>

                    <!-- Documents -->
                    <div *ngIf="order.documents && order.documents.length > 0">
                        <p-card header="Uploaded Documents" class="shadow-lg">
                            <div class="space-y-3">
                                <div *ngFor="let doc of order.documents" class="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                                    <div class="flex items-center gap-3">
                                        <i class="pi pi-file text-2xl text-blue-500"></i>
                                        <div>
                                            <p class="font-semibold">{{ doc.fileName }}</p>
                                            <p class="text-sm text-gray-600">{{ formatFileSize(doc.fileSize) }} • {{ doc.uploadedAt | date: 'MMM dd, yyyy' }}</p>
                                        </div>
                                    </div>
                                    <p-button icon="pi pi-download" [text]="true" [rounded]="true"></p-button>
                                </div>
                            </div>
                        </p-card>
                    </div>
                </div>

                <!-- Sidebar: Payment & Actions -->
                <div class="space-y-6">
                    <!-- Payment Info -->
                    <p-card header="Payment Information" class="shadow-lg">
                        <div class="space-y-4">
                            <div class="bg-blue-50 p-4 rounded-lg">
                                <p class="text-gray-600 text-sm">Total Amount</p>
                                <p class="font-bold text-2xl text-primary-600">₱{{ order.totalAmount | number: '1.2-2' }}</p>
                            </div>
                            <p-divider></p-divider>
                            <div>
                                <p class="text-gray-600 text-sm mb-2">Payment Method</p>
                                <p class="font-semibold capitalize">{{ order.payment.paymentMethod }}</p>
                            </div>
                            <div>
                                <p class="text-gray-600 text-sm mb-2">Payment Status</p>
                                <p-tag [value]="order.payment.status | uppercase" [severity]="getPaymentStatusSeverity(order.payment.status)"></p-tag>
                            </div>
                            <div *ngIf="order.payment.referenceNo">
                                <p class="text-gray-600 text-sm mb-2">Reference Number</p>
                                <p class="font-semibold bg-gray-50 p-2 rounded text-sm">{{ order.payment.referenceNo }}</p>
                            </div>
                        </div>
                    </p-card>

                    <!-- Actions -->
                    <p-card>
                        <div class="space-y-2">
                            <p-button label="Edit Order" icon="pi pi-pencil" [disabled]="order.status !== 'pending'" (click)="editOrder()" class="w-full"></p-button>
                            <p-button label="Cancel Order" icon="pi pi-times" severity="danger" [disabled]="order.status !== 'pending'" (click)="cancelOrder()" class="w-full"></p-button>
                            <p-button label="Back to Orders" icon="pi pi-arrow-left" severity="secondary" (click)="goBack()" class="w-full"></p-button>
                        </div>
                    </p-card>
                </div>
            </div>

            <div *ngIf="!isLoading && !order" class="text-center py-12">
                <p class="text-xl text-gray-600">Order not found</p>
                <p-button label="Back to Orders" (click)="goBack()" class="mt-4"></p-button>
            </div>

            <p-toast></p-toast>
        </div>
    `,
    styles: [
        `
            :host ::ng-deep {
                .p-card {
                    border-radius: 12px;
                }
            }
        `
    ]
})
export class OrderDetailComponent implements OnInit {
    order: Order | null = null;
    isLoading = true;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private ordersService: OrdersService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.route.params.subscribe((params) => {
            const orderId = params['id'];
            if (orderId) {
                this.loadOrder(orderId);
            }
        });
    }

    loadOrder(orderId: string) {
        this.isLoading = true;
        this.ordersService.getOrder(orderId).subscribe({
            next: (order: Order | null) => {
                this.order = order;
                this.isLoading = false;
            },
            error: (err: any) => {
                console.error('Failed to load order', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load order details'
                });
                this.isLoading = false;
            }
        });
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

    getPaymentStatusSeverity(status: PaymentStatus): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
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

    editOrder() {
        this.messageService.add({
            severity: 'info',
            summary: 'Coming Soon',
            detail: 'Edit functionality will be available soon'
        });
    }

    cancelOrder() {
        if (confirm('Are you sure you want to cancel this order?')) {
            this.messageService.add({
                severity: 'info',
                summary: 'Coming Soon',
                detail: 'Cancel functionality will be available soon'
            });
        }
    }

    goBack() {
        this.router.navigate(['/pages/orders']);
    }
}
