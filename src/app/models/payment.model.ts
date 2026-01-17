export type PaymentMethod = 'gcash' | 'pay-on-shop';
export type PaymentStatusType = 'pending' | 'verified' | 'failed';

export interface Payment {
    paymentId: string;
    orderId: string;
    userId: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatusType;
    receiptUrl?: string;
    paymentDate?: Date;
    verifiedBy?: string;
    createdAt: Date;
    updatedAt?: Date;
}
