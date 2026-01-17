export interface Service {
    serviceId: string;
    name: string;
    description: string;
    basePrice: number;
    pricePerPage: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
}
