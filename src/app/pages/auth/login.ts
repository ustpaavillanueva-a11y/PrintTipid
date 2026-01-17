import { Component, ViewChild, ElementRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageModule } from 'primeng/message';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { MenuItem } from 'primeng/api';
import { FirebaseService } from '../../services/firebase.service';
import { UserService } from '../../services/user.service';
import { LayoutService } from '../../layout/service/layout.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, MessageModule, MenuModule, DialogModule],
    styles: [
        `
            :host ::ng-deep {
                --primary-color: #621517 !important;

                .color-button {
                    color: #621517;
                }

                .text-primary {
                    color: #621517 !important;
                }

                p-button .p-button {
                    background-color: #621517 !important;
                    border-color: #621517 !important;
                    color: white;
                }

                p-button .p-button-label {
                    color: white !important;
                }

                p-button .p-button:hover {
                    background-color: #4a0f0f !important;
                    border-color: #4a0f0f !important;
                }

                p-button[styleClass*='p-button-outlined'] .p-button {
                    background-color: transparent !important;
                    border: 2px solid #621517 !important;
                    color: #621517 !important;
                }

                p-button[styleClass*='p-button-outlined'] .p-button-label {
                    color: #621517 !important;
                }

                p-button[styleClass*='p-button-outlined'] .p-button:hover {
                    background-color: #621517 !important;
                    color: white !important;
                }

                p-button[styleClass*='p-button-outlined'] .p-button-label:hover {
                    color: white !important;
                }

                a.text-primary,
                span.text-primary {
                    color: #621517 !important;
                }

                .loading-modal-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 1.5rem;
                    padding: 2rem;
                }

                .loading-modal-svg {
                    width: 150px;
                    height: 60px;
                }

                :host ::ng-deep .transparent-modal .p-dialog-mask {
                    background-color: transparent;
                }

                :host ::ng-deep .transparent-modal .p-dialog {
                    background-color: transparent;
                    box-shadow: none;
                }

                :host ::ng-deep .transparent-modal .p-dialog-header {
                    background-color: transparent;
                    border: none;
                    padding: 0;
                }

                :host ::ng-deep .transparent-modal .p-dialog-title {
                    display: none;
                }

                :host ::ng-deep .transparent-modal .p-dialog-content {
                    padding: 0;
                    background-color: transparent;
                }
            }
        `
    ],
    template: `
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <!-- Color Menu Button (Top Right) -->
            <div class="fixed top-4 right-4">
                <p-menu #colorMenu [model]="colorMenuItems" [popup]="true" [appendTo]="'body'" (onHide)="colorMenuActive = false"></p-menu>
            </div>

            <!-- Loading Modal -->
            <p-dialog [(visible)]="loading" [modal]="true" [closable]="false" [draggable]="false" header="Processing..." [style]="{ width: '400px' }" [styleClass]="'transparent-modal'">
                <div class="loading-modal-content">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" class="loading-modal-svg">
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
                    <span class="text-surface-900 dark:text-surface-0 text-lg font-medium">Please wait...</span>
                </div>
            </p-dialog>

            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <img src="/login.jpg" alt="Login" class="mb-8 w-48 shrink-0 mx-auto rounded-lg object-cover" />
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Welcome to PrinTipid!</div>
                            <span class="text-muted-color font-medium">Sign in to continue</span>
                        </div>

                        @if (errorMessage) {
                            <p-message severity="error" [text]="errorMessage" styleClass="mb-4 w-full"></p-message>
                        }
                        @if (successMessage) {
                            <p-message severity="success" [text]="successMessage" styleClass="mb-4 w-full"></p-message>
                        }

                        <div>
                            <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Email</label>
                            <input pInputText id="email1" type="text" placeholder="Email address" class="w-full md:w-120 mb-8" [(ngModel)]="email" />

                            <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Password</label>
                            <p-password id="password1" [(ngModel)]="password" placeholder="Password" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

                            <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                <div class="flex items-center">
                                    <p-checkbox [(ngModel)]="checked" id="rememberme1" binary class="mr-2"></p-checkbox>
                                    <label for="rememberme1">Remember me</label>
                                </div>
                                <span class="font-medium no-underline ml-2 text-right cursor-pointer text-primary">Forgot password?</span>
                            </div>
                            <p-button label="Sign In" styleClass="w-full mb-4" (onClick)="onLogin()" [disabled]="loading"></p-button>

                            <div class="flex items-center mb-4">
                                <div class="flex-1 border-t border-surface-200 dark:border-surface-700"></div>
                                <span class="px-4 text-muted-color text-sm">OR</span>
                                <div class="flex-1 border-t border-surface-200 dark:border-surface-700"></div>
                            </div>

                            <p-button label="Continue with Google" icon="pi pi-google" styleClass="w-full p-button-outlined" (onClick)="onGoogleLogin()" [disabled]="loadingGoogle"> </p-button>

                            <div class="text-center mt-4">
                                <span class="text-muted-color">Don't have an account? </span>
                                <span class="font-medium cursor-pointer text-primary" routerLink="/auth/signup">Sign Up</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class Login {
    email: string = '';
    password: string = '';
    checked: boolean = false;
    loading: boolean = false;
    loadingGoogle: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';
    isRegisterMode: boolean = false;
    colorMenuItems: MenuItem[] = [];
    colorMenuActive = false;

    @ViewChild('colorMenu') colorMenu: any;
    @ViewChild('colorButton') colorButton: ElementRef | undefined;

    firebaseService = inject(FirebaseService);
    userService = inject(UserService);
    router = inject(Router);
    layoutService = inject(LayoutService);

    constructor() {}

    ngOnInit() {
        this.initColorMenu();
    }

    ngAfterViewInit() {
        // Set brown as default theme color for both CSS variable and layout service
        this.setThemeColor('#621517');
        // Update layout service to show brown-ish primary color
        this.layoutService.layoutConfig.update((state) => ({ ...state, primary: 'rose' }));
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

    onLogin() {
        if (!this.email || !this.password) {
            this.errorMessage = 'Please enter email and password';
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            this.errorMessage = 'Please enter a valid email address';
            return;
        }

        this.loading = true;
        this.errorMessage = '';
        this.successMessage = '';

        if (this.isRegisterMode) {
            // Register new user
            this.firebaseService.register(this.email, this.password).subscribe({
                next: (result) => {
                    // Create user document in Firestore with default role 'customer'
                    if (result.user) {
                        this.userService.createUser(result.user, 'customer').subscribe({
                            next: () => {
                                this.successMessage = 'Account created successfully! Redirecting...';
                                setTimeout(() => {
                                    this.loading = false;
                                    this.router.navigate(['/dashboard']);
                                }, 3000);
                            },
                            error: (err) => {
                                console.error('Failed to create user document', err);
                                this.successMessage = 'Account created successfully! Redirecting...';
                                setTimeout(() => {
                                    this.loading = false;
                                    this.router.navigate(['/dashboard']);
                                }, 3000);
                            }
                        });
                    }
                },
                error: (error) => {
                    this.loading = false;
                    console.error('Registration error:', error);
                    this.errorMessage = this.getErrorMessage(error.code || error.message || 'Registration failed');
                }
            });
        } else {
            // Login existing user
            this.firebaseService.login(this.email, this.password).subscribe({
                next: (result) => {
                    this.successMessage = 'Login successful! Redirecting...';
                    setTimeout(() => {
                        this.loading = false;
                        this.router.navigate(['/dashboard']);
                    }, 3000);
                },
                error: (error) => {
                    this.loading = false;
                    console.error('Login failed:', error);
                    this.errorMessage = this.getErrorMessage(error.code || error.message || 'Login failed');
                    // Log the full error for debugging
                 
                }
            });
        }
    }

    onGoogleLogin() {
        this.loadingGoogle = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.firebaseService.loginWithGoogle().subscribe({
            next: (result) => {
                this.loadingGoogle = false;
                this.successMessage = 'Login successful! Redirecting...';
                setTimeout(() => {
                    this.router.navigate(['/dashboard']);
                }, 2000);
            },
            error: (error) => {
                this.loadingGoogle = false;
                console.error('Google login error:', error);

                // Check if it's a redirect flow (no error means it's processing)
                if (error?.code === 'auth/popup-closed-by-user') {
                    this.errorMessage = 'Login cancelled';
                } else if (error?.code === 'auth/popup-blocked') {
                    this.errorMessage = 'Popups are blocked. Please allow popups for this site.';
                } else if (!error) {
                    // Silent - redirect in progress
                    this.successMessage = 'Redirecting to Google...';
                    return;
                } else {
                    this.errorMessage = 'Google login failed. Please try again.';
                }
            }
        });
    }

    toggleMode() {
        this.isRegisterMode = !this.isRegisterMode;
        this.errorMessage = '';
        this.successMessage = '';
    }

    getErrorMessage(code: string): string {
        switch (code) {
            case 'auth/invalid-email':
                return 'Invalid email address';
            case 'auth/user-disabled':
                return 'This account has been disabled';
            case 'auth/user-not-found':
            case 'EMAIL_NOT_FOUND':
                return 'No account found with this email';
            case 'auth/wrong-password':
            case 'INVALID_PASSWORD':
                return 'Incorrect password';
            case 'auth/email-already-in-use':
                return 'Email already registered';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters';
            case 'auth/invalid-credential':
            case 'INVALID_LOGIN_CREDENTIALS':
                return 'Invalid email or password';
            default:
                return 'Login failed. Please try again.';
        }
    }
}
