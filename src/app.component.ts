import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PwaInstallPromptComponent } from '@/app/components/pwa-install-prompt.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, PwaInstallPromptComponent],
    template: `
        <router-outlet></router-outlet>
        <app-pwa-install-prompt></app-pwa-install-prompt>
    `
})
export class AppComponent {}
