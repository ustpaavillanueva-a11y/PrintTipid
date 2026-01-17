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
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { Firestore, collection, getDocs, doc, updateDoc } from '@angular/fire/firestore';
import { from, map } from 'rxjs';

interface User {
    uid: string;
    email: string;
    name?: string;
    displayName?: string;
    role: 'user' | 'admin';
    createdAt: Date;
    updatedAt?: Date;
    isActive?: boolean;
    phoneNumber?: string;
    address?: string;
}

@Component({
    selector: 'app-admin-all-users',
    standalone: true,
    imports: [CommonModule, RouterModule, TableModule, ButtonModule, TagModule, CardModule, TooltipModule, DialogModule, DividerModule, SelectButtonModule, FormsModule, InputTextModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="card">
            <p-card header="All Users" styleClass="mb-0">
                <ng-template pTemplate="header">
                    <div class="flex justify-between items-center p-4">
                        <h2 class="text-2xl font-semibold m-0">All Users</h2>
                        <span class="p-input-icon-left">
                            <i class="pi pi-search"></i>
                            <input pInputText type="text" (input)="onGlobalFilter($event)" placeholder="Search users..." class="w-full" />
                        </span>
                    </div>
                </ng-template>

                <p-table #dt [value]="users" [rows]="10" [paginator]="true" responsiveLayout="scroll" styleClass="p-datatable-striped" [globalFilterFields]="['email', 'name', 'displayName', 'uid']">
                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="email">Email <p-sortIcon field="email"></p-sortIcon></th>
                            <th pSortableColumn="name">Name <p-sortIcon field="name"></p-sortIcon></th>
                            <th pSortableColumn="role">Role <p-sortIcon field="role"></p-sortIcon></th>
                            <th pSortableColumn="createdAt">Registered <p-sortIcon field="createdAt"></p-sortIcon></th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-user>
                        <tr>
                            <td class="font-medium">{{ user.email }}</td>
                            <td>{{ getUserName(user) }}</td>
                            <td>
                                <p-tag [value]="user.role.toUpperCase()" [severity]="user.role === 'admin' ? 'danger' : 'info'"> </p-tag>
                            </td>
                            <td>{{ user.createdAt | date: 'MMM dd, yyyy' }}</td>
                            <td>
                                <p-tag [value]="user.isActive !== false ? 'ACTIVE' : 'INACTIVE'" [severity]="user.isActive !== false ? 'success' : 'secondary'"> </p-tag>
                            </td>
                            <td>
                                <div class="flex gap-2">
                                    <p-button icon="pi pi-eye" [rounded]="true" [text]="true" (click)="viewUser(user)" pTooltip="View Details" tooltipPosition="top"> </p-button>
                                    <p-button icon="pi pi-user-edit" [rounded]="true" [text]="true" severity="info" (click)="editRole(user)" pTooltip="Change Role" tooltipPosition="top"> </p-button>
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="6" class="text-center py-4">
                                <p class="text-muted-color">No users found.</p>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        </div>

        <!-- View User Details Modal -->
        <p-dialog [(visible)]="showViewModal" [header]="'User Details'" [modal]="true" [style]="{ width: '50vw' }" [breakpoints]="{ '960px': '75vw', '640px': '90vw' }">
            <div *ngIf="selectedUser" class="space-y-4">
                <div class="flex justify-between items-center">
                    <div>
                        <p class="text-sm text-gray-600">Email</p>
                        <p class="font-semibold">{{ selectedUser.email }}</p>
                    </div>
                    <p-tag [value]="selectedUser.role.toUpperCase()" [severity]="selectedUser.role === 'admin' ? 'danger' : 'info'"> </p-tag>
                </div>

                <p-divider></p-divider>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600">Name</p>
                        <p class="font-semibold">{{ getUserName(selectedUser) }}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-600">User ID</p>
                        <p class="font-mono text-sm">{{ selectedUser.uid }}</p>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-600">Registration Date</p>
                        <p class="font-semibold">{{ selectedUser.createdAt | date: 'MMM dd, yyyy HH:mm' }}</p>
                    </div>
                    <div *ngIf="selectedUser.updatedAt">
                        <p class="text-sm text-gray-600">Last Updated</p>
                        <p class="font-semibold">{{ selectedUser.updatedAt | date: 'MMM dd, yyyy HH:mm' }}</p>
                    </div>
                </div>

                <p-divider></p-divider>

                <div>
                    <p class="text-sm text-gray-600">Status</p>
                    <p-tag [value]="selectedUser.isActive !== false ? 'ACTIVE' : 'INACTIVE'" [severity]="selectedUser.isActive !== false ? 'success' : 'secondary'"> </p-tag>
                </div>

                <div *ngIf="selectedUser.phoneNumber">
                    <p class="text-sm text-gray-600">Phone Number</p>
                    <p class="font-semibold">{{ selectedUser.phoneNumber }}</p>
                </div>

                <div *ngIf="selectedUser.address">
                    <p class="text-sm text-gray-600">Address</p>
                    <p class="font-semibold">{{ selectedUser.address }}</p>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <p-button label="Close" icon="pi pi-times" (click)="showViewModal = false" severity="secondary"> </p-button>
            </ng-template>
        </p-dialog>

        <!-- Edit Role Modal -->
        <p-dialog [(visible)]="showEditModal" header="Change User Role" [modal]="true" [style]="{ width: '400px' }">
            <div *ngIf="selectedUser" class="space-y-4">
                <div>
                    <p class="text-sm text-gray-600 mb-2">User</p>
                    <p class="font-semibold">{{ getUserName(selectedUser) }} ({{ selectedUser.email }})</p>
                </div>

                <div>
                    <p class="text-sm text-gray-600 mb-2">Current Role</p>
                    <p-tag [value]="selectedUser.role.toUpperCase()" [severity]="selectedUser.role === 'admin' ? 'danger' : 'info'"> </p-tag>
                </div>

                <p-divider></p-divider>

                <div>
                    <label for="newRole" class="block text-sm font-medium mb-2">New Role</label>
                    <p-selectButton [(ngModel)]="newRole" [options]="roleOptions" optionLabel="label" optionValue="value" styleClass="w-full"> </p-selectButton>
                </div>

                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-3 mt-3">
                    <p class="text-sm text-yellow-800">
                        <i class="pi pi-exclamation-triangle mr-2"></i>
                        Changing user roles affects their system permissions.
                    </p>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <p-button label="Cancel" icon="pi pi-times" (click)="showEditModal = false" severity="secondary"> </p-button>
                <p-button label="Update Role" icon="pi pi-check" (click)="saveRole()" [disabled]="!newRole || newRole === selectedUser?.role"> </p-button>
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
export class AdminAllUsersComponent {
    private firestore = inject(Firestore);
    private cdr = inject(ChangeDetectorRef);

    users: User[] = [];
    selectedUser: User | null = null;
    showViewModal = false;
    showEditModal = false;
    newRole: 'user' | 'admin' | null = null;

    roleOptions = [
        { label: 'User', value: 'user' },
        { label: 'Admin', value: 'admin' }
    ];

    ngOnInit() {
        this.loadUsers();
    }

    loadUsers() {
        from(getDocs(collection(this.firestore, 'users')))
            .pipe(
                map((snapshot) => {
                    const usersList: User[] = [];
                    snapshot.forEach((docSnap) => {
                        const data = docSnap.data() as any;
                        usersList.push({
                            uid: docSnap.id,
                            email: data['email'] || '',
                            name: data['name'],
                            displayName: data['displayName'],
                            role: data['role'] || 'user',
                            createdAt: this.toDate(data['createdAt']),
                            updatedAt: this.toDate(data['updatedAt']),
                            isActive: data['isActive'] !== false,
                            phoneNumber: data['phoneNumber'],
                            address: data['address']
                        });
                    });
                    return usersList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                })
            )
            .subscribe({
                next: (users) => {
                    this.users = users;
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    console.error('Failed to load users', err);
                    this.cdr.markForCheck();
                }
            });
    }

    getUserName(user: User): string {
        return user.name || user.displayName || 'N/A';
    }

    viewUser(user: User) {
        this.selectedUser = user;
        this.showViewModal = true;
        this.cdr.markForCheck();
    }

    editRole(user: User) {
        this.selectedUser = user;
        this.newRole = user.role;
        this.showEditModal = true;
        this.cdr.markForCheck();
    }

    saveRole() {
        if (!this.selectedUser || !this.newRole || this.newRole === this.selectedUser.role) {
            return;
        }

        const userRef = doc(this.firestore, 'users', this.selectedUser.uid);
        from(
            updateDoc(userRef, {
                role: this.newRole,
                updatedAt: new Date()
            })
        ).subscribe({
            next: () => {
                this.showEditModal = false;
                this.loadUsers();
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Failed to update user role', err);
                this.cdr.markForCheck();
            }
        });
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
}
