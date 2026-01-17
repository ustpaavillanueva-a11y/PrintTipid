import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Injectable({
    providedIn: 'root'
})
export class PwaInstallService {
    private installPromptEvent: BeforeInstallPromptEvent | null = null;
    private installPromptAvailable$ = new BehaviorSubject<boolean>(false);
    private appInstalled$ = new BehaviorSubject<boolean>(false);

    constructor(private ngZone: NgZone) {
        console.log('[PWA] PwaInstallService initialized');
        this.logBrowserCapabilities();
        this.setupInstallPrompt();
        this.checkIfAppIsInstalled();
    }

    private logBrowserCapabilities(): void {
        console.log('[PWA] Browser Capabilities:');
        console.log('  - User Agent:', navigator.userAgent);
        console.log('  - Service Worker Support:', 'serviceWorker' in navigator);
        console.log('  - HTTPS:', window.location.protocol === 'https:');
        console.log('  - Manifest Link:', document.querySelector('link[rel="manifest"]')?.getAttribute('href'));
    }

    private setupInstallPrompt(): void {
        console.log('[PWA] Setting up install prompt listeners');

        this.ngZone.runOutsideAngular(() => {
            window.addEventListener('beforeinstallprompt', (event: Event) => {
                console.log('[PWA] beforeinstallprompt event fired on window');
                event.preventDefault();
                this.installPromptEvent = event as BeforeInstallPromptEvent;
                this.ngZone.run(() => {
                    console.log('[PWA] Setting installPromptAvailable to true');
                    this.installPromptAvailable$.next(true);
                });
            });

            window.addEventListener('appinstalled', () => {
                console.log('[PWA] App installed event fired');
                this.ngZone.run(() => {
                    this.installPromptAvailable$.next(false);
                    this.appInstalled$.next(true);
                });
            });

            // Also listen for the event on document
            (document as any).addEventListener('beforeinstallprompt', (event: Event) => {
                console.log('[PWA] beforeinstallprompt event fired on document');
                event.preventDefault();
                this.installPromptEvent = event as BeforeInstallPromptEvent;
                this.ngZone.run(() => {
                    console.log('[PWA] Setting installPromptAvailable to true (document)');
                    this.installPromptAvailable$.next(true);
                });
            });
        });
    }

    private checkIfAppIsInstalled(): void {
        // Check if app is running in standalone mode (installed)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
        console.log('[PWA] App installed check:', isStandalone);
        this.appInstalled$.next(isStandalone);
    }

    isInstallPromptAvailable(): Observable<boolean> {
        return this.installPromptAvailable$.asObservable();
    }

    isAppInstalled(): Observable<boolean> {
        return this.appInstalled$.asObservable();
    }

    async promptInstall(): Promise<void> {
        if (this.installPromptEvent) {
            console.log('[PWA] Prompting install via beforeinstallprompt event');
            try {
                await this.installPromptEvent.prompt();
                const { outcome } = await this.installPromptEvent.userChoice;
                console.log('[PWA] Install outcome:', outcome);
                if (outcome === 'accepted') {
                    this.installPromptAvailable$.next(false);
                    this.appInstalled$.next(true);
                }
            } catch (error) {
                console.error('[PWA] Error during install prompt:', error);
            }
        } else {
            console.log('[PWA] No install prompt event available');
            // Show instructions or alternative installation method
            const userAgent = navigator.userAgent.toLowerCase();
            let instructions = '';

            if (userAgent.includes('chrome') || userAgent.includes('edge')) {
                instructions = 'To install: Look for the "Install" icon in the address bar or use menu > "Install app"';
            } else if (userAgent.includes('safari') || userAgent.includes('iphone') || userAgent.includes('ipad')) {
                instructions = 'To install: Tap Share > Add to Home Screen';
            } else if (userAgent.includes('firefox')) {
                instructions = 'To install: Look for the install icon in the address bar';
            } else {
                instructions = 'Your browser may not support app installation. Please use Chrome, Edge, or Safari.';
            }

            alert(instructions);
        }
    }
}
