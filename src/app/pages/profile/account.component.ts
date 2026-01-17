import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserService } from '@/app/services/user.service';
import { FirebaseService } from '@/app/services/firebase.service';
import { User } from '@/app/models/user.model';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, Auth } from '@angular/fire/auth';
import { from } from 'rxjs';

@Component({
    selector: 'app-account',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, PasswordModule, DividerModule, ToastModule],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>

        <div>
            <div class="col-12 lg:col-8 lg:col-offset-2">
                <!-- Account Settings Tab -->
                <p-card class="mb-4">
                    <ng-template pTemplate="header">
                        <div class="bg-linear-to-r from-primary-500 to-primary-600 px-6 py-8 text-white">
                            <h1 class="text-3xl font-bold m-0">Account Settings</h1>
                            <p class="text-lg opacity-90 m-0 mt-2">Manage your account security and preferences</p>
                        </div>
                    </ng-template>

                    <div class="space-y-6">
                        <!-- Email Section -->
                        <div>
                            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
                                <i class="pi pi-envelope text-primary-600"></i>
                                Email Address
                            </h3>
                            <div class="bg-blue-50 p-4 rounded-lg">
                                <p class="text-sm text-gray-600 font-semibold mb-2">Current Email</p>
                                <p class="font-mono">{{ currentUser?.email }}</p>
                                <p class="text-xs text-gray-500 mt-3">Email cannot be changed. Please contact support if you need to update your email address.</p>
                            </div>
                        </div>

                        <p-divider></p-divider>

                        <!-- Change Password Section -->
                        <div>
                            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
                                <i class="pi pi-lock text-primary-600"></i>
                                Change Password
                            </h3>

                            <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="space-y-4">
                                <div class="field">
                                    <label for="currentPassword" class="font-semibold block mb-2">Current Password</label>
                                    <p-password id="currentPassword" formControlName="currentPassword" [feedback]="false" class="w-full" placeholder="Enter your current password"></p-password>
                                    <p class="text-red-500 text-sm mt-1" *ngIf="passwordForm.get('currentPassword')?.hasError('required') && passwordForm.get('currentPassword')?.touched">Current password is required</p>
                                </div>

                                <div class="field">
                                    <label for="newPassword" class="font-semibold block mb-2">New Password</label>
                                    <p-password id="newPassword" formControlName="newPassword" class="w-full" placeholder="Enter new password (min 8 characters)" [feedback]="true"></p-password>
                                    <p class="text-red-500 text-sm mt-1" *ngIf="passwordForm.get('newPassword')?.hasError('required') && passwordForm.get('newPassword')?.touched">New password is required</p>
                                    <p class="text-red-500 text-sm mt-1" *ngIf="passwordForm.get('newPassword')?.hasError('minlength') && passwordForm.get('newPassword')?.touched">Password must be at least 8 characters</p>
                                </div>

                                <div class="field">
                                    <label for="confirmPassword" class="font-semibold block mb-2">Confirm Password</label>
                                    <p-password id="confirmPassword" formControlName="confirmPassword" [feedback]="false" class="w-full" placeholder="Confirm your new password"></p-password>
                                    <p class="text-red-500 text-sm mt-1" *ngIf="passwordForm.get('confirmPassword')?.hasError('required') && passwordForm.get('confirmPassword')?.touched">Confirm password is required</p>
                                    <p class="text-red-500 text-sm mt-1" *ngIf="passwordForm.hasError('passwordMismatch') && passwordForm.get('confirmPassword')?.touched">Passwords do not match</p>
                                </div>

                                <div class="flex gap-2 justify-end mt-6">
                                    <p-button type="button" label="Cancel" severity="secondary" (click)="resetPasswordForm()"></p-button>
                                    <p-button type="submit" label="Change Password" severity="success" icon="pi pi-check" [loading]="isChangingPassword" [disabled]="passwordForm.invalid || isChangingPassword"></p-button>
                                </div>
                            </form>
                        </div>

                        <p-divider></p-divider>

                        <!-- Account Status -->
                        <div>
                            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
                                <i class="pi pi-info-circle text-primary-600"></i>
                                Account Status
                            </h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="bg-green-50 p-4 rounded-lg">
                                    <p class="text-sm text-gray-600 font-semibold mb-2">Account Status</p>
                                    <p class="text-lg font-bold text-green-700">Active</p>
                                </div>
                                <div class="bg-blue-50 p-4 rounded-lg">
                                    <p class="text-sm text-gray-600 font-semibold mb-2">Member Since</p>
                                    <p class="text-lg">{{ currentUser?.createdAt | date: 'MMM dd, yyyy' }}</p>
                                </div>
                                <div class="bg-purple-50 p-4 rounded-lg">
                                    <p class="text-sm text-gray-600 font-semibold mb-2">Account Type</p>
                                    <p class="text-lg font-bold text-purple-700 capitalize">{{ currentUser?.role }}</p>
                                </div>
                                <div class="bg-orange-50 p-4 rounded-lg">
                                    <p class="text-sm text-gray-600 font-semibold mb-2">Last Updated</p>
                                    <p class="text-lg">{{ currentUser?.updatedAt | date: 'MMM dd, yyyy HH:mm' }}</p>
                                </div>
                            </div>
                        </div>

                        <p-divider></p-divider>

                        <!-- Security Tips -->
                        <div>
                            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
                                <i class="pi pi-shield text-primary-600"></i>
                                Security Tips
                            </h3>
                            <ul class="list-disc list-inside space-y-2 text-gray-700">
                                <li>Use a strong password with a mix of uppercase, lowercase, numbers, and symbols</li>
                                <li>Change your password regularly for better account security</li>
                                <li>Never share your password with anyone</li>
                                <li>Logout from other sessions if you suspect unauthorized access</li>
                                <li>Keep your email address up to date for account recovery</li>
                            </ul>
                        </div>
                    </div>
                </p-card>
            </div>
        </div>
    `
})
export class AccountComponent implements OnInit {
    userService = inject(UserService);
    firebaseService = inject(FirebaseService);
    auth = inject(Auth);
    fb = inject(FormBuilder);
    messageService = inject(MessageService);

    currentUser: User | null = null;
    isChangingPassword = false;

    passwordForm: FormGroup;

    constructor() {
        this.passwordForm = this.fb.group(
            {
                currentPassword: ['', Validators.required],
                newPassword: ['', [Validators.required, Validators.minLength(8)]],
                confirmPassword: ['', Validators.required]
            },
            { validators: this.passwordMatchValidator }
        );
    }

    ngOnInit() {
        this.loadCurrentUser();
    }

    loadCurrentUser() {
        this.userService.getCurrentUserData().subscribe((user) => {
            this.currentUser = user;
        });
    }

    passwordMatchValidator(group: FormGroup) {
        const newPassword = group.get('newPassword')?.value;
        const confirmPassword = group.get('confirmPassword')?.value;

        if (newPassword !== confirmPassword) {
            return { passwordMismatch: true };
        }
        return null;
    }

    onChangePassword() {
        if (this.passwordForm.invalid) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fix form errors' });
            return;
        }

        const { currentPassword, newPassword } = this.passwordForm.value;
        const currentAuthUser = this.auth.currentUser;

        if (!currentAuthUser || !currentAuthUser.email) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'User not authenticated' });
            return;
        }

        this.isChangingPassword = true;

        // Reauthenticate user with current password
        const credential = EmailAuthProvider.credential(currentAuthUser.email, currentPassword);

        from(reauthenticateWithCredential(currentAuthUser, credential)).subscribe({
            next: () => {
                // Password is correct, now update to new password
                from(updatePassword(currentAuthUser, newPassword)).subscribe({
                    next: () => {
                        this.isChangingPassword = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Password changed successfully!'
                        });
                        this.resetPasswordForm();
                    },
                    error: (err) => {
                        this.isChangingPassword = false;
                        console.error('Password update failed:', err);
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Error',
                            detail: 'Failed to change password. Please try again.'
                        });
                    }
                });
            },
            error: (err) => {
                this.isChangingPassword = false;
                console.error('Reauthentication failed:', err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Current password is incorrect'
                });
            }
        });
    }

    resetPasswordForm() {
        this.passwordForm.reset();
    }
}
