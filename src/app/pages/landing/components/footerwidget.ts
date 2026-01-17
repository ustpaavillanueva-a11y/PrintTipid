import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'footer-widget',
    imports: [RouterModule],
    template: `
        <div class="py-12 px-12 mx-0 mt-20 lg:mx-20 border-t border-surface-200 dark:border-surface-700">
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 md:col-span-2">
                    <a (click)="router.navigate(['/landing'], { fragment: 'home' })" class="flex flex-wrap items-center justify-center md:justify-start md:mb-0 mb-6 cursor-pointer">
                        <img src="/ssc.png" alt="SSC Logo" style="height: 40px; width: auto; object-fit: contain; margin-right: 0.5rem;" />
                        <h4 class="font-bold text-2xl text-surface-900 dark:text-surface-0">PrinTipid</h4>
                    </a>
                </div>

                <div class="col-span-12 md:col-span-10">
                    <div class="grid grid-cols-12 gap-8 text-center md:text-left">
                        <div class="col-span-12 md:col-span-3">
                            <h4 class="font-medium text-xl leading-normal mb-6 text-surface-900 dark:text-surface-0">About</h4>
                            <a class="leading-normal text-lg block cursor-pointer mb-2 text-surface-700 dark:text-surface-100 hover:text-primary-color transition-colors">About PrinTipid</a>
                            <a class="leading-normal text-lg block cursor-pointer mb-2 text-surface-700 dark:text-surface-100 hover:text-primary-color transition-colors">Contact Us</a>
                            <a class="leading-normal text-lg block cursor-pointer text-surface-700 dark:text-surface-100 hover:text-primary-color transition-colors">Support</a>
                        </div>

                        <div class="col-span-12 md:col-span-3">
                            <h4 class="font-medium text-xl leading-normal mb-6 text-surface-900 dark:text-surface-0">Services</h4>
                            <a class="leading-normal text-lg block cursor-pointer mb-2 text-surface-700 dark:text-surface-100 hover:text-primary-color transition-colors">Print Orders</a>
                            <a class="leading-normal text-lg block cursor-pointer mb-2 text-surface-700 dark:text-surface-100 hover:text-primary-color transition-colors">Pricing</a>
                            <a class="leading-normal text-lg block cursor-pointer text-surface-700 dark:text-surface-100 hover:text-primary-color transition-colors">FAQ</a>
                        </div>

                        <div class="col-span-12 md:col-span-3">
                            <h4 class="font-medium text-xl leading-normal mb-6 text-surface-900 dark:text-surface-0">Community</h4>
                            <a class="leading-normal text-lg block cursor-pointer mb-2 text-surface-700 dark:text-surface-100 hover:text-primary-color transition-colors">Blog</a>
                            <a class="leading-normal text-lg block cursor-pointer mb-2 text-surface-700 dark:text-surface-100 hover:text-primary-color transition-colors">Social Media</a>
                            <a class="leading-normal text-lg block cursor-pointer text-surface-700 dark:text-surface-100 hover:text-primary-color transition-colors">Events</a>
                        </div>

                        <div class="col-span-12 md:col-span-3">
                            <h4 class="font-medium text-xl leading-normal mb-6 text-surface-900 dark:text-surface-0">Legal</h4>
                            <a class="leading-normal text-lg block cursor-pointer mb-2 text-surface-700 dark:text-surface-100 hover:text-primary-color transition-colors">Privacy Policy</a>
                            <a class="leading-normal text-lg block cursor-pointer mb-2 text-surface-700 dark:text-surface-100 hover:text-primary-color transition-colors">Terms of Service</a>
                            <a class="leading-normal text-lg block cursor-pointer text-surface-700 dark:text-surface-100 hover:text-primary-color transition-colors">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="border-t border-surface-200 dark:border-surface-700 mt-12 pt-6 text-center text-surface-600 dark:text-surface-300 text-lg">
                <p>&copy; 2026 PrinTipid. All rights reserved. Smart printing for TCC students.</p>
            </div>
        </div>
    `
})
export class FooterWidget {
    constructor(public router: Router) {}
}
