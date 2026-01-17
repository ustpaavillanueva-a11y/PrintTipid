import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '@/app/layout/service/layout.service';
import { FirebaseService } from '@/app/services/firebase.service';
import { UserService } from '@/app/services/user.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, MenuModule, AppConfigurator, DialogModule],
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
            .logout-modal-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 1.5rem;
                padding: 1rem;
            }
            .logout-modal-svg {
                width: 150px;
                height: 60px;
            }
            :host ::ng-deep .transparent-logout-modal .p-dialog-mask {
                background-color: transparent;
            }
            :host ::ng-deep .transparent-logout-modal .p-dialog {
                background-color: transparent;
                box-shadow: none;
            }
            :host ::ng-deep .transparent-logout-modal .p-dialog-header {
                background-color: transparent;
                border: none;
                padding: 0;
            }
            :host ::ng-deep .transparent-logout-modal .p-dialog-title {
                display: none;
            }
            :host ::ng-deep .transparent-logout-modal .p-dialog-content {
                padding: 0;
                background-color: transparent;
            }
        `
    ],
    template: ` <div class="layout-topbar">
        <!-- Logout Loading Modal -->
        <p-dialog [(visible)]="loggingOut" [modal]="true" [closable]="false" [draggable]="false" header="Logging out..." [style]="{ width: '400px' }" [styleClass]="'transparent-logout-modal'">
            <div class="logout-modal-content">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="logout-modal-svg">
                    <rect fill="#FFF" width="100%" height="100%" />
                    <rect fill="#FF156D" stroke="#FF156D" stroke-width="5" width="30" height="30" x="25" y="50">
                        <animate attributeName="y" calcMode="spline" dur="2" values="50;120;50;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate>
                    </rect>
                    <rect fill="#FF156D" stroke="#FF156D" stroke-width="5" width="30" height="30" x="85" y="50">
                        <animate attributeName="y" calcMode="spline" dur="2" values="50;120;50;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate>
                    </rect>
                    <rect fill="#FF156D" stroke="#FF156D" stroke-width="5" width="30" height="30" x="145" y="50">
                        <animate attributeName="y" calcMode="spline" dur="2" values="50;120;50;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate>
                    </rect>
                </svg>
                <span class="text-surface-900 dark:text-surface-0 text-lg font-medium">See you soon!</span>
            </div>
        </p-dialog>

        <div class="layout-topbar">
            <div class="layout-topbar-logo-container">
                <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                    <i class="pi pi-bars"></i>
                </button>
                <a class="layout-topbar-logo" routerLink="/">
                    <img src="/ssc.png" alt="SSC Logo" style="height: 40px; width: auto; object-fit: contain;" />
                    <span>PrinTipid</span>
                </a>
            </div>

            <div class="layout-topbar-actions">
                <div class="layout-config-menu">
                    <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                        <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                    </button>
                    <div class="relative">
                        <button #colorButton type="button" class="layout-topbar-action layout-topbar-action-highlight" (click)="onColorMenuToggle($event)" [attr.aria-haspopup]="true" [attr.aria-expanded]="colorMenuActive">
                            <i class="pi pi-palette"></i>
                        </button>
                        <p-menu #colorMenu [model]="colorMenuItems" [popup]="true" [appendTo]="'body'" (onHide)="colorMenuActive = false"></p-menu>
                        <app-configurator />
                    </div>
                </div>

                <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                    <i class="pi pi-ellipsis-v"></i>
                </button>

                <div class="layout-topbar-menu hidden lg:block">
                    <div class="layout-topbar-menu-content">
                        <button #profileButton type="button" class="layout-topbar-action" (click)="onProfileMenuToggle($event)" [attr.aria-haspopup]="true" [attr.aria-expanded]="profileMenuActive">
                            <i class="pi pi-user"></i>
                        </button>
                        <p-menu #profileMenu [model]="profileMenuItems" [popup]="true" [appendTo]="'body'" (onHide)="profileMenuActive = false"></p-menu>
                    </div>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    items!: MenuItem[];
    profileMenuItems: MenuItem[] = [];
    profileMenuActive = false;
    colorMenuItems: MenuItem[] = [];
    colorMenuActive = false;
    loggingOut = false;

    @ViewChild('profileMenu') profileMenu: any;
    @ViewChild('profileButton') profileButton: ElementRef | undefined;
    @ViewChild('colorMenu') colorMenu: any;
    @ViewChild('colorButton') colorButton: ElementRef | undefined;

    layoutService = inject(LayoutService);
    firebaseService = inject(FirebaseService);
    userService = inject(UserService);
    router = inject(Router);

    currentUser$ = this.userService.getCurrentUserData();

    ngOnInit() {
        this.initProfileMenu();
        this.initColorMenu();

        // Console log current user data
        this.currentUser$.subscribe((user) => {
            console.log('Current User:', user);
            console.log('User Role:', user?.role);
            console.log('User Email:', user?.email);
            console.log('User Name:', user?.name);
        });

        // Console log Firebase Auth user
        this.firebaseService.getCurrentUser().subscribe((authUser) => {
            console.log('Firebase Auth User:', authUser);
        });
    }

    ngAfterViewInit() {
        // Set brown as default theme color
        this.setThemeColor('#621517');
    }

    initProfileMenu() {
        this.profileMenuItems = [
            {
                label: 'Profile',
                icon: 'pi pi-user',
                command: () => {
                    this.router.navigate(['/pages/profile']);
                }
            },
            {
                label: 'Account',
                icon: 'pi pi-cog',
                command: () => {
                    this.router.navigate(['/pages/account']);
                }
            },
            {
                separator: true
            },
            {
                label: 'Logout',
                icon: 'pi pi-sign-out',
                command: () => {
                    this.onLogout();
                }
            }
        ];
    }

    initColorMenu() {
        this.colorMenuItems = [
            {
                label: 'Colors',
                items: [
                    {
                        label: '🔴 Red',
                        command: () => {
                            this.setThemeColor('#EF4444');
                        }
                    },
                    {
                        label: '🟠 Orange',
                        command: () => {
                            this.setThemeColor('#F97316');
                        }
                    },
                    {
                        label: '🟡 Yellow',
                        command: () => {
                            this.setThemeColor('#EAB308');
                        }
                    },
                    {
                        label: '🟢 Green',
                        command: () => {
                            this.setThemeColor('#22C55E');
                        }
                    },
                    {
                        label: '🔵 Blue',
                        command: () => {
                            this.setThemeColor('#3B82F6');
                        }
                    },
                    {
                        label: '🟣 Purple',
                        command: () => {
                            this.setThemeColor('#A855F7');
                        }
                    },
                    {
                        label: '🩷 Pink',
                        command: () => {
                            this.setThemeColor('#EC4899');
                        }
                    },
                    {
                        label: '🟤 Brown',
                        command: () => {
                            this.setThemeColor('#621517');
                        }
                    }
                ]
            }
        ];
    }

    setThemeColor(color: string) {
        const style = document.documentElement.style;
        style.setProperty('--primary-color', color);
        this.colorMenuActive = false;
    }

    onColorMenuToggle(event: Event) {
        this.colorMenuActive = true;
        this.colorMenu.toggle(event);
    }

    onProfileMenuToggle(event: Event) {
        this.profileMenuActive = true;
        this.profileMenu.toggle(event);
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }

    onLogout() {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to logout?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#621517',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel'
        }).then((result: SweetAlertResult<any>) => {
            if (result.isConfirmed) {
                this.loggingOut = true;

                // Show loading animation
                Swal.fire({
                    title: 'See you soon!',
                    html: `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" style="width: 150px; height: 60px; margin: 1.5rem auto;">
                            <rect fill="#FFF" width="100%" height="100%"/>
                            <rect fill="#FF156D" stroke="#FF156D" stroke-width="5" width="30" height="30" x="25" y="50">
                                <animate attributeName="y" calcMode="spline" dur="2" values="50;120;50;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate>
                            </rect>
                            <rect fill="#FF156D" stroke="#FF156D" stroke-width="5" width="30" height="30" x="85" y="50">
                                <animate attributeName="y" calcMode="spline" dur="2" values="50;120;50;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate>
                            </rect>
                            <rect fill="#FF156D" stroke="#FF156D" stroke-width="5" width="30" height="30" x="145" y="50">
                                <animate attributeName="y" calcMode="spline" dur="2" values="50;120;50;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate>
                            </rect>
                        </svg>
                    `,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        setTimeout(() => {
                            this.firebaseService.logout().subscribe({
                                next: () => {
                                    this.loggingOut = false;
                                    Swal.close();
                                    this.router.navigate(['/auth/login']);
                                },
                                error: (err) => {
                                    console.error('Logout failed', err);
                                    this.loggingOut = false;
                                    Swal.close();
                                }
                            });
                        }, 3000);
                    }
                });
            }
        });
    }
}
