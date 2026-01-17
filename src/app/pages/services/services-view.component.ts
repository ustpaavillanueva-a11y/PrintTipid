import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ServicesService } from '@/app/services/services.service';
import { Service } from '@/app/models';

@Component({
    selector: 'app-services-view',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, DividerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid">
            <div class="col-12">
                <p-card header="Our Printing Services" styleClass="mb-4">
                    <p class="text-gray-700 mb-4">We offer a wide range of professional printing services tailored to your needs. From simple black and white documents to full-color marketing materials, we have you covered.</p>
                </p-card>
            </div>

            <div *ngFor="let service of services" class="col-12 md:col-6 lg:col-4">
                <p-card [title]="service.name" styleClass="h-full">
                    <p class="text-gray-600 mb-4">{{ service.description }}</p>

                    <p-divider></p-divider>

                    <div class="space-y-2 my-4">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Base Price:</span>
                            <span class="font-semibold">₱{{ service.basePrice | number: '1.2-2' }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Price per Page:</span>
                            <span class="font-semibold">₱{{ service.pricePerPage | number: '1.2-2' }}</span>
                        </div>
                    </div>

                    <p-divider></p-divider>

                    <div class="mt-4">
                        <p-button label="Use Service" routerLink="/pages/orders/new" styleClass="w-full" icon="pi pi-arrow-right"></p-button>
                    </div>
                </p-card>
            </div>
        </div>
    `
})
export class ServicesViewComponent implements OnInit {
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
