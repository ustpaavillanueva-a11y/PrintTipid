import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ServicesService } from '@/app/services/services.service';
import { Service } from '@/app/models';

@Component({
    selector: 'app-services-pricing',
    standalone: true,
    imports: [CommonModule, CardModule, TableModule, ButtonModule, DividerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid">
            <div class="col-12">
                <p-card header="Pricing Guide" styleClass="mb-4">
                    <p class="text-gray-700 mb-4">Our transparent pricing structure ensures you know exactly what you're paying for. Prices vary based on volume, quality, and delivery timeframe.</p>

                    <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <p class="font-semibold text-blue-900 mb-2">Pricing Factors:</p>
                        <ul class="list-disc list-inside text-sm text-blue-800 space-y-1">
                            <li>Number of pages and copies</li>
                            <li>Color mode (Black & White vs Color)</li>
                            <li>Paper type and quality</li>
                            <li>Rush delivery charges may apply</li>
                            <li>Volume discounts available</li>
                        </ul>
                    </div>
                </p-card>
            </div>

            <div class="col-12">
                <p-card header="Service Pricing Table">
                    <p-table [value]="services" responsiveLayout="scroll">
                        <ng-template pTemplate="header">
                            <tr>
                                <th>Service</th>
                                <th>Base Price</th>
                                <th>Type</th>
                                <th>Turnaround</th>
                                <th>Action</th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-service>
                            <tr>
                                <td>
                                    <div>
                                        <p class="font-semibold">{{ service.name }}</p>
                                        <p class="text-sm text-gray-600">{{ service.description }}</p>
                                    </div>
                                </td>
                                <td class="font-semibold">₱{{ service.basePrice | number: '1.2-2' }}</td>
                                <td class="text-sm text-gray-600">{{ service.description }}</td>
                                <td>
                                    <span class="inline-block px-2 py-1 rounded text-white text-xs" [ngClass]="service.isActive ? 'bg-green-500' : 'bg-red-500'">{{ service.isActive ? 'Active' : 'Inactive' }}</span>
                                </td>
                                <td>
                                    <p-button label="Order" size="small" routerLink="/pages/orders/new" icon="pi pi-shopping-cart"></p-button>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </p-card>
            </div>

            <div class="col-12">
                <p-card header="Additional Information">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-green-50 p-4 rounded-lg">
                            <h3 class="font-semibold text-green-900 mb-2 flex items-center gap-2">
                                <i class="pi pi-check-circle"></i>
                                Quality Guarantee
                            </h3>
                            <p class="text-sm text-gray-700">All prints are checked for quality before delivery. We use premium materials and professional equipment.</p>
                        </div>
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <h3 class="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                <i class="pi pi-clock"></i>
                                Fast Delivery
                            </h3>
                            <p class="text-sm text-gray-700">We offer rush delivery options. Most standard orders can be completed within 24-48 hours.</p>
                        </div>
                        <div class="bg-purple-50 p-4 rounded-lg">
                            <h3 class="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                                <i class="pi pi-shield"></i>
                                Data Security
                            </h3>
                            <p class="text-sm text-gray-700">Your files are secure and encrypted. We automatically delete files after 30 days.</p>
                        </div>
                        <div class="bg-orange-50 p-4 rounded-lg">
                            <h3 class="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                                <i class="pi pi-headphones"></i>
                                Customer Support
                            </h3>
                            <p class="text-sm text-gray-700">Need help? Our support team is available to assist you with any questions.</p>
                        </div>
                    </div>
                </p-card>
            </div>
        </div>
    `
})
export class ServicesPricingComponent implements OnInit {
    private servicesService = inject(ServicesService);

    services: Service[] = [];

    ngOnInit() {
        this.loadServices();
    }

    loadServices() {
        this.servicesService.getActiveServices().subscribe({
            next: (services: Service[]) => {
                this.services = services;
            },
            error: (err: any) => {
                console.error('Failed to load services:', err);
            }
        });
    }
}
