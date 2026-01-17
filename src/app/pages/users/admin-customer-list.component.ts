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
import { InputTextModule } from 'primeng/inputtext';
import { Firestore, collection, getDocs, query, where } from '@angular/fire/firestore';
import { from, map } from 'rxjs';
import { OrdersService } from '@/app/services/orders.service';
import { Order } from '@/app/models';

interface Customer {
    uid: string;
    email: string;
    name?: string;
    displayName?: string;
    phoneNumber?: string;
    address?: string;
    createdAt: Date;
    updatedAt?: Date;
    totalOrders: number;
    totalSpent: number;
}

@Component({
    selector: 'app-admin-customer-list',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, TagModule, CardModule, TooltipModule, DialogModule, DividerModule, FormsModule, InputTextModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="card">
            <p-card header="Customer List" styleClass="mb-0">
                <ng-template pTemplate="header">
                    <div class="flex justify-between items-center p-4">
                        <h2 class="text-2xl font-semibold m-0">Customers</h2>
                        <span class="p-input-icon-left">
                            <i class="pi pi-search"></i>
                            <input pInputText type="text" (input)="onGlobalFilter($event)" placeholder="Search customers..." class="w-full" />
                        </span>
                    </div>
                </ng-template>

                <p-table #dt [value]="customers" [rows]="10" [paginator]="true" responsiveLayout="scroll" styleClass="p-datatable-striped" [globalFilterFields]="['email', 'name', 'displayName', 'uid']">
                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="name">Name <p-sortIcon field="name"></p-sortIcon></th>
                            <th pSortableColumn="email">Email <p-sortIcon field="email"></p-sortIcon></th>
                            <th pSortableColumn="totalOrders">Orders <p-sortIcon field="totalOrders"></p-sortIcon></th>
                            <th pSortableColumn="totalSpent">Total Spent <p-sortIcon field="totalSpent"></p-sortIcon></th>
                            <th pSortableColumn="createdAt">Member Since <p-sortIcon field="createdAt"></p-sortIcon></th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-customer>
                        <tr>
                            <td class="font-semibold">{{ customer.name || customer.displayName || 'N/A' }}</td>
                            <td class="font-medium">{{ customer.email }}</td>
                            <td>
                                <p-tag [value]="customer.totalOrders.toString()" severity="info" [rounded]="true"> </p-tag>
                            </td>
                            <td class="font-semibold">₱{{ customer.totalSpent | number: '1.2-2' }}</td>
                            <td>{{ customer.createdAt | date: 'MMM dd, yyyy' }}</td>
                            <td>
                                <div class="flex gap-2">
                                    <p-button icon="pi pi-eye" [rounded]="true" [text]="true" (click)="viewCustomer(customer)" pTooltip="View Details" tooltipPosition="top"> </p-button>
                                    <p-button icon="pi pi-history" [rounded]="true" [text]="true" severity="info" (click)="viewOrders(customer)" pTooltip="View Orders" tooltipPosition="top"> </p-button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="6" class="text-center py-4">
                                <p class="text-muted-color">No customers found.</p>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        </div>

        <!-- View Customer Details Modal -->
        <p-dialog [(visible)]="showViewModal" header="Customer Details" [modal]="true" [style]="{ width: '50vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <div *ngIf="selectedCustomer" class="space-y-4">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm text-gray-600">Email</p>
                        <p class="font-semibold">{{ selectedCustomer.email }}</p>
                    </div>
                </div>

                <p-divider></p-divider>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600">Name</p>
                        <p class="font-semibold">{{ selectedCustomer.name || selectedCustomer.displayName || 'N/A' }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">Customer ID</p>
                        <p class="font-mono text-sm">{{ selectedCustomer.uid }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600">Member Since</p>
                        <p class="font-semibold">{{ selectedCustomer.createdAt | date: 'MMM dd, yyyy HH:mm' }}</p>
                    </div>
                    <div *ngIf="selectedCustomer.updatedAt">
                        <p class="text-sm text-gray-600">Last Updated</p>
                        <p class="font-semibold">{{ selectedCustomer.updatedAt | date: 'MMM dd, yyyy HH:mm' }}</p>
                    </div>
                </div>

                <p-divider></p-divider>

                <div class="grid grid-cols-3 gap-3">
                    <div class="bg-blue-50 p-3 rounded text-center">
                        <p class="text-gray-600 text-sm">Total Orders</p>
                        <p class="font-bold text-xl text-primary-600">{{ selectedCustomer.totalOrders }}</p>
                    </div>
                    <div class="bg-green-50 p-3 rounded text-center">
                        <p class="text-gray-600 text-sm">Total Spent</p>
                        <p class="font-bold text-lg text-emerald-600">₱{{ selectedCustomer.totalSpent | number: '1.2-2' }}</p>
                    </div>
                    <div class="bg-purple-50 p-3 rounded text-center">
                        <p class="text-gray-600 text-sm">Avg. Order Value</p>
                        <p class="font-bold text-lg text-purple-600">₱{{ selectedCustomer.totalSpent / (selectedCustomer.totalOrders || 1) | number: '1.2-2' }}</p>
                    </div>
                </div>

                <div *ngIf="selectedCustomer.phoneNumber">
                    <p class="text-sm text-gray-600">Phone Number</p>
                    <p class="font-semibold">{{ selectedCustomer.phoneNumber }}</p>
                </div>

                <div *ngIf="selectedCustomer.address">
                    <p class="text-sm text-gray-600">Address</p>
                    <p class="font-semibold">{{ selectedCustomer.address }}</p>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <p-button label="Close" icon="pi pi-times" (click)="showViewModal = false" severity="secondary"> </p-button>
            </ng-template>
        </p-dialog>

        <!-- View Customer Orders Modal -->
        <p-dialog [(visible)]="showOrdersModal" [header]="'Orders - ' + (selectedCustomer?.name || selectedCustomer?.displayName || 'Customer')" [modal]="true" [style]="{ width: '80vw' }" [breakpoints]="{ '960px': '90vw', '640px': '95vw' }">
            <p-table [value]="customerOrders" [rows]="5" [paginator]="true" responsiveLayout="scroll" styleClass="p-datatable-striped">
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="orderId">Order ID <p-sortIcon field="orderId"></p-sortIcon></th>
                        <th pSortableColumn="createdAt">Date <p-sortIcon field="createdAt"></p-sortIcon></th>
                        <th pSortableColumn="totalAmount">Amount <p-sortIcon field="totalAmount"></p-sortIcon></th>
                        <th>Status</th>
                        <th>Payment</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-order>
                    <tr>
                        <td class="font-semibold">{{ order.orderId }}</td>
                        <td>{{ order.createdAt | date: 'MMM dd, yyyy HH:mm' }}</td>
                        <td class="font-semibold">₱{{ order.totalAmount | number: '1.2-2' }}</td>
                        <td>
                            <p-tag [value]="getStatusLabel(order.status)" [severity]="getStatusSeverity(order.status)" class="text-xs"> </p-tag>
                        </td>
                        <td>
                            <p-tag [value]="order.payment.status | uppercase" [severity]="getPaymentStatusSeverity(order.payment.status)"> </p-tag>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="5" class="text-center py-4">
                            <p class="text-muted-color">No orders found.</p>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <ng-template pTemplate="footer">
                <p-button label="Close" icon="pi pi-times" (click)="showOrdersModal = false" severity="secondary"> </p-button>
            </ng-template>
        </p-dialog>
    `,
    styles: [
        `
            :host ::ng-deep {
                .p-datatable .p-datatable-thead > tr > th {
                    background-color: var(--primary-color);
                    color: white;
                }
            }
        `
    ]
})
export class AdminCustomerListComponent {
    private firestore = inject(Firestore);
    private ordersService = inject(OrdersService);
    private cdr = inject(ChangeDetectorRef);

    customers: Customer[] = [];
    selectedCustomer: Customer | null = null;
    customerOrders: Order[] = [];
    showViewModal = false;
    showOrdersModal = false;

    ngOnInit() {
        this.loadCustomers();
    }

    loadCustomers() {
        from(getDocs(collection(this.firestore, 'users'))).subscribe({
            next: (snapshot) => {
                const customersList: Customer[] = [];
                snapshot.forEach((docSnap) => {
                    const data = docSnap.data() as any;
                    // Include all users, not just non-admin
                    customersList.push({
                        uid: docSnap.id,
                        email: data['email'] || '',
                        name: data['name'],
                        displayName: data['displayName'],
                        phoneNumber: data['phoneNumber'],
                        address: data['address'],
                        createdAt: this.toDate(data['createdAt']),
                        updatedAt: this.toDate(data['updatedAt']),
                        totalOrders: 0,
                        totalSpent: 0
                    });
                });

                // Load order data for each customer
                this.ordersService.getAllOrders().subscribe({
                    next: (orders) => {
                        const ordersByUser = new Map<string, { count: number; total: number }>();

                        orders.forEach((order) => {
                            if (!ordersByUser.has(order.userId)) {
                                ordersByUser.set(order.userId, { count: 0, total: 0 });
                            }
                            const stats = ordersByUser.get(order.userId)!;
                            stats.count++;
                            stats.total += order.totalAmount || 0;
                        });

                        // Update customers with order stats
                        customersList.forEach((customer) => {
                            const stats = ordersByUser.get(customer.uid);
                            if (stats) {
                                customer.totalOrders = stats.count;
                                customer.totalSpent = stats.total;
                            }
                        });

                        // Sort by total spent (descending)
                        this.customers = customersList.sort((a, b) => b.totalSpent - a.totalSpent);
                        this.cdr.markForCheck();
                    },
                    error: (err) => {
                        console.error('Failed to load order data', err);
                        this.customers = customersList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                        this.cdr.markForCheck();
                    }
                });
            },
            error: (err) => {
                console.error('Failed to load customers', err);
                this.cdr.markForCheck();
            }
        });
    }

    viewCustomer(customer: Customer) {
        this.selectedCustomer = customer;
        this.showViewModal = true;
        this.cdr.markForCheck();
    }

    viewOrders(customer: Customer) {
        this.selectedCustomer = customer;
        this.ordersService.getAllOrders().subscribe({
            next: (orders) => {
                this.customerOrders = orders
                    .filter((o) => o.userId === customer.uid)
                    .map((o) => this.normalizeOrder(o))
                    .sort((a, b) => {
                        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
                        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
                        return dateB - dateA;
                    });
                this.showOrdersModal = true;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to load customer orders', err);
                this.cdr.markForCheck();
            }
        });
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

    onGlobalFilter(event: Event) {
        const input = event.target as HTMLInputElement;
        const table = document.querySelector('p-table') as any;
        if (table && table.filterGlobal) {
            table.filterGlobal(input.value, 'contains');
        }
    }

    private toDate(val: any): Date {
        if (val?.toDate) return val.toDate();
        if (val instanceof Date) return val;
        if (val) return new Date(val);
        return new Date();
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
