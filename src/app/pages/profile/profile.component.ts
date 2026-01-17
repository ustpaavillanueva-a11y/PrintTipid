import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { UserService } from '@/app/services/user.service';
import { FirebaseService } from '@/app/services/firebase.service';
import { User } from '@/app/models/user.model';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, AvatarModule, DividerModule, TagModule],
    template: `
        <div>
            <div class="col-12 lg:col-8 lg:col-offset-2">
                <p-card>
                    <ng-template pTemplate="header">
                        <div class="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-8 text-white">
                            <div class="flex items-center gap-4">
                                <p-avatar [label]="getInitials()" size="xlarge" shape="circle" styleClass="text-4xl bg-white text-primary-600"></p-avatar>
                                <div>
                                    <h1 class="text-3xl font-bold m-0 mb-2">{{ currentUser?.name || 'User' }}</h1>
                                    <p class="text-lg opacity-90 m-0">{{ currentUser?.email }}</p>
                                </div>
                            </div>
                        </div>
                    </ng-template>

                    <div class="space-y-4">
                        <!-- User Information -->
                        <div>
                            <h2 class="text-2xl font-semibold mb-4">Profile Information</h2>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="bg-blue-50 p-4 rounded-lg">
                                    <label class="text-sm text-gray-600 font-semibold">User ID</label>
                                    <p class="font-mono text-sm mt-2 break-all">{{ currentUser?.uid }}</p>
                                </div>
                                <div class="bg-green-50 p-4 rounded-lg">
                                    <label class="text-sm text-gray-600 font-semibold">Role</label>
                                    <div class="mt-2">
                                        <p-tag [value]="currentUser?.role?.toUpperCase()" [severity]="getRoleSeverity()" styleClass="text-lg"></p-tag>
                                    </div>
                                </div>
                                <div class="bg-purple-50 p-4 rounded-lg">
                                    <label class="text-sm text-gray-600 font-semibold">Email</label>
                                    <p class="mt-2 break-all">{{ currentUser?.email }}</p>
                                </div>
                                <div class="bg-orange-50 p-4 rounded-lg">
                                    <label class="text-sm text-gray-600 font-semibold">Name</label>
                                    <p class="mt-2">{{ currentUser?.name || 'Not set' }}</p>
                                </div>
                                <div class="bg-indigo-50 p-4 rounded-lg">
                                    <label class="text-sm text-gray-600 font-semibold">Phone</label>
                                    <p class="mt-2">{{ currentUser?.phone || 'Not set' }}</p>
                                </div>
                                <div class="bg-pink-50 p-4 rounded-lg">
                                    <label class="text-sm text-gray-600 font-semibold">Address</label>
                                    <p class="mt-2">{{ currentUser?.address || 'Not set' }}</p>
                                </div>
                            </div>
                        </div>

                        <p-divider></p-divider>

                        <!-- Account Details -->
                        <div>
                            <h3 class="text-xl font-semibold mb-3">Account Details</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <label class="text-sm text-gray-600 font-semibold">Account Created</label>
                                    <p class="mt-2">{{ currentUser?.createdAt | date: 'MMM dd, yyyy HH:mm' }}</p>
                                </div>
                                <div class="bg-gray-50 p-4 rounded-lg">
                                    <label class="text-sm text-gray-600 font-semibold">Last Updated</label>
                                    <p class="mt-2">{{ currentUser?.updatedAt | date: 'MMM dd, yyyy HH:mm' }}</p>
                                </div>
                            </div>
                        </div>

                        <p-divider></p-divider>

                        <!-- Edit Profile Section -->
                        <div *ngIf="isEditing">
                            <h3 class="text-xl font-semibold mb-3">Edit Profile</h3>
                            <div class="space-y-3">
                                <div class="field">
                                    <label class="font-semibold block mb-2">Name</label>
                                    <input pInputText [(ngModel)]="editForm.name" class="w-full" />
                                </div>
                                <div class="field">
                                    <label class="font-semibold block mb-2">Phone</label>
                                    <input pInputText [(ngModel)]="editForm.phone" class="w-full" />
                                </div>
                                <div class="field">
                                    <label class="font-semibold block mb-2">Address</label>
                                    <input pInputText [(ngModel)]="editForm.address" class="w-full" />
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex gap-2 justify-end mt-4">
                            <p-button *ngIf="!isEditing" label="Edit Profile" icon="pi pi-pencil" (click)="startEdit()"></p-button>
                            <p-button *ngIf="isEditing" label="Cancel" icon="pi pi-times" severity="secondary" (click)="cancelEdit()"></p-button>
                            <p-button *ngIf="isEditing" label="Save Changes" icon="pi pi-check" severity="success" (click)="saveProfile()" [loading]="isSaving"></p-button>
                        </div>
                    </div>
                </p-card>
            </div>
        </div>
    `
})
export class ProfileComponent implements OnInit {
    userService = inject(UserService);
    firebaseService = inject(FirebaseService);

    currentUser: User | null = null;
    isEditing = false;
    isSaving = false;
    editForm = {
        name: '',
        phone: '',
        address: ''
    };

    ngOnInit() {
        this.loadProfile();
    }

    loadProfile() {
        this.userService.getCurrentUserData().subscribe((user) => {
            this.currentUser = user;
            if (user) {
                this.editForm = {
                    name: user.name || '',
                    phone: user.phone || '',
                    address: user.address || ''
                };
            }
        });
    }

    getInitials(): string {
        if (!this.currentUser?.name) return 'U';
        const names = this.currentUser.name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return this.currentUser.name[0].toUpperCase();
    }

    getRoleSeverity(): 'success' | 'info' | 'warn' {
        switch (this.currentUser?.role) {
            case 'admin':
                return 'success';
            case 'customer':
                return 'info';
            default:
                return 'warn';
        }
    }

    startEdit() {
        this.isEditing = true;
    }

    cancelEdit() {
        this.isEditing = false;
        if (this.currentUser) {
            this.editForm = {
                name: this.currentUser.name || '',
                phone: this.currentUser.phone || '',
                address: this.currentUser.address || ''
            };
        }
    }

    saveProfile() {
        if (!this.currentUser?.uid) return;

        this.isSaving = true;
        this.userService.updateUserProfile(this.currentUser.uid, this.editForm).subscribe({
            next: () => {
                this.isSaving = false;
                this.isEditing = false;
                alert('Profile updated successfully!');
            },
            error: (err) => {
                console.error('Failed to update profile', err);
                this.isSaving = false;
                alert('Failed to update profile. Please try again.');
            }
        });
    }
}
