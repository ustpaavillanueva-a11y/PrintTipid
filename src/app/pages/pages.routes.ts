import { Routes } from '@angular/router';
import { Documentation } from './documentation/documentation';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { NewOrderComponent } from './orders/new-order.component';
import { OrdersListComponent } from './orders/orders-list.component';
import { OrderDetailComponent } from './orders/order-detail.component';
import { OrderHistoryComponent } from './orders/order-history.component';
import { ProfileComponent } from './profile/profile.component';
import { AccountComponent } from './profile/account.component';
import { PendingPaymentsComponent } from './payments/pending-payments.component';
import { PaymentHistoryComponent } from './payments/payment-history.component';
import { ServicesViewComponent } from './services/services-view.component';
import { ServicesPricingComponent } from './services/services-pricing.component';
import { SettingsComponent } from './settings/settings.component';
import { AdminOrdersComponent } from './orders/admin-orders.component';
import { AdminPendingOrdersComponent } from './orders/admin-pending-orders.component';
import { AdminInProgressOrdersComponent } from './orders/admin-in-progress-orders.component';
import { AdminCompletedOrdersComponent } from './orders/admin-completed-orders.component';
import { AdminTodayOrdersComponent } from './orders/admin-today-orders.component';
import { AdminPaymentVerificationComponent } from './orders/admin-payment-verification.component';
import { AdminVerifiedPaymentsComponent } from './orders/admin-verified-payments.component';
import { AdminPaymentHistoryComponent } from './orders/admin-payment-history.component';
import { AdminAllUsersComponent } from './users/admin-all-users.component';
import { AdminCustomerListComponent } from './users/admin-customer-list.component';
import { adminGuard } from '../guards/admin.guard';

export default [
    { path: 'documentation', component: Documentation },
    { path: 'crud', component: Crud },
    { path: 'empty', component: Empty },
    { path: 'orders', component: OrdersListComponent },
    { path: 'orders/new', component: NewOrderComponent },
    { path: 'orders/history', component: OrderHistoryComponent },
    { path: 'orders/:id', component: OrderDetailComponent },
    { path: 'payments/pending', component: PendingPaymentsComponent },
    { path: 'payments/history', component: PaymentHistoryComponent },
    { path: 'services/view', component: ServicesViewComponent },
    { path: 'services/pricing', component: ServicesPricingComponent },
    { path: 'admin/dashboard/today', component: AdminTodayOrdersComponent, canActivate: [adminGuard] },
    { path: 'admin/orders/all', component: AdminOrdersComponent, canActivate: [adminGuard] },
    { path: 'admin/orders/pending', component: AdminPendingOrdersComponent, canActivate: [adminGuard] },
    { path: 'admin/orders/progress', component: AdminInProgressOrdersComponent, canActivate: [adminGuard] },
    { path: 'admin/orders/completed', component: AdminCompletedOrdersComponent, canActivate: [adminGuard] },
    { path: 'admin/payments/verify', component: AdminPaymentVerificationComponent, canActivate: [adminGuard] },
    { path: 'admin/payments/verified', component: AdminVerifiedPaymentsComponent, canActivate: [adminGuard] },
    { path: 'admin/payments/history', component: AdminPaymentHistoryComponent, canActivate: [adminGuard] },
    { path: 'admin/users/all', component: AdminAllUsersComponent, canActivate: [adminGuard] },
    { path: 'admin/users/customers', component: AdminCustomerListComponent, canActivate: [adminGuard] },
    { path: 'profile', component: ProfileComponent },
    { path: 'account', component: AccountComponent },
    { path: 'settings', component: SettingsComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
