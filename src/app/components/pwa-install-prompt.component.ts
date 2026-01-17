import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PwaInstallService } from '@/app/services/pwa-install.service';

@Component({
    selector: 'app-pwa-install-prompt',
    standalone: true,
    imports: [CommonModule, ButtonModule],
    styles: [
        `
            :host {
                display: contents;
            }

            :host.pwa-banner-visible {
                display: block;
            }

            :host.pwa-banner-visible::before {
                content: '';
                display: block;
                height: 140px;
            }

            :host ::ng-deep .pwa-install-banner {
                position: fixed;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(90deg, rgba(98, 21, 23, 0.98), rgba(98, 21, 23, 0.95));
                padding: 1.5rem 2rem;
                box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.4);
                z-index: 9999;
                animation: slideUp 0.3s ease-out;
                backdrop-filter: blur(10px);
                pointer-events: all;
                width: 100%;
                box-sizing: border-box;
            }

            @keyframes slideUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            :host ::ng-deep .pwa-install-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 2rem;
                max-width: 1200px;
                margin: 0 auto;
            }

            :host ::ng-deep .pwa-install-text {
                flex: 1;
                color: white;
            }

            :host ::ng-deep .pwa-install-text h3 {
                margin: 0 0 0.5rem 0;
                font-size: 1.25rem;
                font-weight: 600;
            }

            :host ::ng-deep .pwa-install-text p {
                margin: 0;
                font-size: 0.95rem;
                opacity: 0.95;
            }

            :host ::ng-deep .pwa-install-actions {
                display: flex;
                gap: 1rem;
                pointer-events: auto;
            }

            :host ::ng-deep .pwa-install-actions .p-button {
                min-width: 120px;
                pointer-events: auto !important;
                cursor: pointer !important;
            }

            :host ::ng-deep .pwa-install-actions .p-button-success {
                background-color: #22c55e;
                border-color: #22c55e;
            }

            :host ::ng-deep .pwa-install-actions .p-button-text {
                color: white;
            }

            :host ::ng-deep .pwa-install-actions .p-button-text:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }

            @media (max-width: 768px) {
                :host ::ng-deep .pwa-install-banner {
                    padding: 1rem;
                }

                :host ::ng-deep .pwa-install-content {
                    flex-direction: column;
                    gap: 1rem;
                }

                :host ::ng-deep .pwa-install-actions {
                    width: 100%;
                }

                :host ::ng-deep .pwa-install-actions .p-button {
                    flex: 1;
                }
            }
        `
    ],
    template: `
        <div *ngIf="showPrompt$ | async" class="pwa-install-banner">
            <div class="pwa-install-content">
                <div class="pwa-install-text">
                    <h3>Installation Required</h3>
                    <p>PrintTipid App must be installed on your device for the best experience. Click 'Install Now' to proceed.</p>
                </div>
                <div class="pwa-install-actions">
                    <button pButton type="button" label="Install Now" severity="success" (click)="onInstall()"></button>
                    <button pButton type="button" icon="pi pi-times" [rounded]="true" [text]="true" class="p-button-danger" (click)="onClose()" title="Close"></button>
                </div>
            </div>
        </div>
    `
})
export class PwaInstallPromptComponent implements OnInit {
    pwaInstallService = inject(PwaInstallService);
    showPrompt$ = this.pwaInstallService.isInstallPromptAvailable();

    ngOnInit(): void {
        // Clear any previous dismissal tracking
        localStorage.removeItem('pwa-prompt-dismissals');
        localStorage.removeItem('pwa-prompt-hidden');

        // Log for debugging
        this.showPrompt$.subscribe((show) => {
            console.log('[PWA Component] showPrompt:', show);
        });
    }

    onInstall(): void {
        console.log('[PWA Component] onInstall clicked');
        this.pwaInstallService.promptInstall();
        localStorage.setItem('pwa-prompt-dismissals', '0');
    }

    onClose(): void {
        console.log('[PWA Component] onClose clicked');
        // Reshow prompt on next page load - user must install eventually
        // Only close temporarily but don't hide permanently
    }
}
