import { Component, signal } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'topbar-widget',
    imports: [RouterModule, StyleClassModule, ButtonModule, RippleModule],
    styles: [
        `
            :host ::ng-deep .layout-topbar-action-highlight {
                color: var(--primary-color);
            }
            :host ::ng-deep .layout-topbar-logo span {
                font-size: 1.4rem;
                font-weight: 900;
                font-style: italic;
                color: #fff;
                letter-spacing: 0.5px;
                text-shadow:
                    -2px -2px 0 var(--primary-color),
                    2px -2px 0 var(--primary-color),
                    -2px 2px 0 var(--primary-color),
                    2px 2px 0 var(--primary-color),
                    -1px 0 0 var(--primary-color),
                    1px 0 0 var(--primary-color),
                    0 -1px 0 var(--primary-color),
                    0 1px 0 var(--primary-color);
                filter: drop-shadow(0 3px 6px rgba(98, 21, 23, 0.5));
                position: relative;
            }
            :host ::ng-deep .layout-topbar-logo:hover span {
                filter: drop-shadow(0 5px 12px rgba(98, 21, 23, 0.6));
                letter-spacing: 1px;
                transition: all 0.3s ease;
                font-size: 1.45rem;
            }
            :host ::ng-deep .p-button.p-button-text {
                color: var(--primary-color);
            }
            :host ::ng-deep .p-button.p-button-text:hover {
                background-color: rgba(98, 21, 23, 0.1);
            }
            :host ::ng-deep .p-button:not(.p-button-text) {
                background-color: var(--primary-color);
                border-color: var(--primary-color);
            }
            :host ::ng-deep .p-button:not(.p-button-text):hover {
                background-color: rgba(98, 21, 23, 0.8);
            }
        `
    ],
    template: `
        <div class="flex items-center justify-between w-full relative">
            <a class="layout-topbar-logo flex items-center shrink-0" href="#">
                <img src="/ssc.png" alt="SSC Logo" style="height: 40px; width: auto; object-fit: contain;" />
                <span class="px-4">PrinTipid</span>
            </a>

            <a pButton [text]="true" severity="secondary" [rounded]="true" pRipple class="lg:hidden! absolute right-0" (click)="menuOpen.set(!menuOpen())">
                <i class="pi pi-bars text-2xl!"></i>
            </a>

            <div
                [class.hidden]="!menuOpen()"
                [class.flex]="menuOpen()"
                class="flex-col gap-4 bg-surface-0 dark:bg-surface-900 z-50 fixed lg:static lg:flex lg:px-8 lg:py-0 lg:flex-row lg:items-center hidden top-20 left-0 right-0 px-6 py-4"
                (click)="menuOpen.set(false)"
            >
                <ul class="list-none p-0 m-0 flex flex-col lg:flex-row items-start lg:items-center select-none cursor-pointer gap-4 lg:gap-8">
                    <li>
                        <a (click)="router.navigate(['/landing'], { fragment: 'home' })" pRipple class="text-surface-900 dark:text-surface-0 font-medium text-lg flex items-center gap-2 hover:text-primary-color transition-colors">
                            <i class="pi pi-home text-xl"></i>
                            <span>Home</span>
                        </a>
                    </li>
                    <li>
                        <a (click)="router.navigate(['/landing'], { fragment: 'features' })" pRipple class="text-surface-900 dark:text-surface-0 font-medium text-lg flex items-center gap-2 hover:text-primary-color transition-colors">
                            <i class="pi pi-star text-xl"></i>
                            <span>Features</span>
                        </a>
                    </li>
                    <li>
                        <a (click)="router.navigate(['/landing'], { fragment: 'highlights' })" pRipple class="text-surface-900 dark:text-surface-0 font-medium text-lg flex items-center gap-2 hover:text-primary-color transition-colors">
                            <i class="pi pi-bolt text-xl"></i>
                            <span>Highlights</span>
                        </a>
                    </li>
                </ul>
                <div class="flex flex-col lg:flex-row gap-2 lg:ml-8">
                    <button pButton pRipple label="Login" routerLink="/auth/login" [rounded]="true" [text]="true" class="justify-start lg:justify-center"></button>
                    <button pButton pRipple label="Register" routerLink="/auth/login" [rounded]="true" class="justify-start lg:justify-center"></button>
                </div>
            </div>
        </div>
    `
})
export class TopbarWidget {
    menuOpen = signal(false);

    constructor(public router: Router) {}
}
