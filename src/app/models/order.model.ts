export type OrderStatus = 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'pending' | 'paid';
export type ColorMode = 'bw' | 'color';
export type Orientation = 'portrait' | 'landscape';
export type PaymentMethod = 'gcash' | 'pay_on_shop';
export type PaperSize = 'A4' | 'Letter' | 'Legal' | 'A3';
export type PaperType = 'bond' | 'glossy' | 'matte';

export interface PrintOptions {
    paperSize: PaperSize;
    colorMode: ColorMode;
    paperType: PaperType;
    copies: number;
    pages: number;
    orientation?: Orientation;
    pickupDateTime?: Date;
    note?: string;
}

export interface Payment {
    paymentMethod: PaymentMethod;
    amount: number;
    referenceNo?: string;
    receiptUrl?: string;
    status: PaymentStatus;
}

export interface OrderDocument {
    documentId: string;
    fileName: string;
    fileSize: number;
    fileData?: string; // Base64 encoded file data
    uploadedAt: Date;
}

export interface Order {
    orderId: string;
    userId: string;
    serviceId?: string;
    status: OrderStatus;
    documents: OrderDocument[];
    printOptions: PrintOptions;
    payment: Payment;
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}
