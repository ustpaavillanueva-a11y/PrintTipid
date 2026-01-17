import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserService } from '@/app/services/user.service';
import { User } from '@/app/models/user.model';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, CardModule, ButtonModule, InputTextModule, SelectModule, ToggleButtonModule, DividerModule, ToastModule],
    providers: [MessageService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p-toast></p-toast>

        <div class="grid">
            <div class="col-12 lg:col-8 lg:col-offset-2">
                <!-- Notification Settings -->
                <p-card class="mb-4">
                    <ng-template pTemplate="header">
                        <div class="bg-linear-to-r from-primary-500 to-primary-600 px-6 py-8 text-white w-full">
                            <h1 class="text-3xl font-bold m-0">Settings</h1>
                        </div>
                    </ng-template>

                    <div class="space-y-6">
                        <!-- Email Notifications -->
                        <div>
                            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
                                <i class="pi pi-bell text-primary-600"></i>
                                Notifications
                            </h3>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p class="font-semibold">Order Updates</p>
                                        <p class="text-sm text-gray-600">Receive notifications when your order status changes</p>
                                    </div>
                                    <p-togglebutton [(ngModel)]="settings.orderUpdates" [onIcon]="'pi pi-check'" [offIcon]="'pi pi-times'" styleClass="w-12"></p-togglebutton>
                                </div>

                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p class="font-semibold">Payment Reminders</p>
                                        <p class="text-sm text-gray-600">Get reminders for pending payments</p>
                                    </div>
                                    <p-togglebutton [(ngModel)]="settings.paymentReminders" [onIcon]="'pi pi-check'" [offIcon]="'pi pi-times'" styleClass="w-12"></p-togglebutton>
                                </div>

                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p class="font-semibold">Promotional Emails</p>
                                        <p class="text-sm text-gray-600">Receive updates about new services and promotions</p>
                                    </div>
                                    <p-togglebutton [(ngModel)]="settings.promotionalEmails" [onIcon]="'pi pi-check'" [offIcon]="'pi pi-times'" styleClass="w-12"></p-togglebutton>
                                </div>
                            </div>
                        </div>

                        <p-divider></p-divider>

                        <!-- Privacy Settings -->
                        <div>
                            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
                                <i class="pi pi-shield text-primary-600"></i>
                                Privacy
                            </h3>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p class="font-semibold">Public Profile</p>
                                        <p class="text-sm text-gray-600">Allow others to view your profile</p>
                                    </div>
                                    <p-togglebutton [(ngModel)]="settings.publicProfile" [onIcon]="'pi pi-check'" [offIcon]="'pi pi-times'" styleClass="w-12"></p-togglebutton>
                                </div>

                                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p class="font-semibold">Data Collection</p>
                                        <p class="text-sm text-gray-600">Allow us to collect usage data to improve services</p>
                                    </div>
                                    <p-togglebutton [(ngModel)]="settings.dataCollection" [onIcon]="'pi pi-check'" [offIcon]="'pi pi-times'" styleClass="w-12"></p-togglebutton>
                                </div>
                            </div>
                        </div>

                        <p-divider></p-divider>

                        <!-- Display Settings -->
                        <div>
                            <h3 class="text-xl font-semibold mb-4 flex items-center gap-2">
                                <i class="pi pi-palette text-primary-600"></i>
                                Display
                            </h3>
                            <div class="space-y-3">
                                <div>
                                    <label class="font-semibold block mb-2">Language</label>
                                    <p-select [(ngModel)]="settings.language" [options]="languages" optionLabel="label" optionValue="value" placeholder="Select language" class="w-full"></p-select>
                                </div>

                                <div>
                                    <label class="font-semibold block mb-2">Date Format</label>
                                    <p-select [(ngModel)]="settings.dateFormat" [options]="dateFormats" optionLabel="label" optionValue="value" placeholder="Select format" class="w-full"></p-select>
                                </div>
                            </div>
                        </div>

                        <p-divider></p-divider>

                        <!-- Action Buttons -->
                        <div class="flex gap-2 justify-end">
                            <p-button label="Reset to Defaults" severity="secondary" icon="pi pi-refresh" (click)="resetSettings()"></p-button>
                            <p-button label="Save Settings" severity="success" icon="pi pi-check" (click)="saveSettings()" [loading]="isSaving"></p-button>
                        </div>
                    </div>
                </p-card>
            </div>
        </div>
    `
})
export class SettingsComponent implements OnInit {
    private userService = inject(UserService);
    private fb = inject(FormBuilder);
    private messageService = inject(MessageService);

    isSaving = false;
    currentUser: User | null = null;

    languages = [
        { label: 'English', value: 'en' },
        { label: 'Filipino (Tagalog)', value: 'fil' },
        { label: 'Spanish', value: 'es' }
    ];

    dateFormats = [
        { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
        { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
        { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' }
    ];

    settings = {
        orderUpdates: true,
        paymentReminders: true,
        promotionalEmails: false,
        publicProfile: false,
        dataCollection: true,
        language: 'en',
        dateFormat: 'MM/DD/YYYY'
    };

    ngOnInit() {
        this.loadCurrentUser();
    }

    loadCurrentUser() {
        this.userService.getCurrentUserData().subscribe((user) => {
            this.currentUser = user;
        });
    }

    saveSettings() {
        this.isSaving = true;

        // Simulate saving - in production, you'd call a service
        setTimeout(() => {
            this.isSaving = false;
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Settings saved successfully!'
            });
        }, 1000);
    }

    resetSettings() {
        this.settings = {
            orderUpdates: true,
            paymentReminders: true,
            promotionalEmails: false,
            publicProfile: false,
            dataCollection: true,
            language: 'en',
            dateFormat: 'MM/DD/YYYY'
        };

        this.messageService.add({
            severity: 'info',
            summary: 'Reset',
            detail: 'Settings reset to defaults'
        });
    }
}
