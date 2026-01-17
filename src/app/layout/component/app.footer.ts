import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        PrintTipid &copy; 2026. Built with
        <a href="https://ric-portfolio-beta.vercel.app/" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">RicAngular</a>
    </div>`
})
export class AppFooter {}
