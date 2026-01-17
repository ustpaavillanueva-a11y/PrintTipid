import { OrderStatus } from './order.model';

export interface StatusHistory {
    historyId: string;
    status: OrderStatus;
    updatedBy: string; // Admin UID
    remarks?: string;
    timestamp: Date;
}
