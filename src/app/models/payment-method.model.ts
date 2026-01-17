export interface PaymentMethodConfig {
    methodId: string;
    name: 'GCash' | 'Pay on Shop';
    isActive: boolean;
    gcashNumber?: string;
    gcashName?: string;
    gcashQrUrl?: string;
    updatedAt: Date;
}
