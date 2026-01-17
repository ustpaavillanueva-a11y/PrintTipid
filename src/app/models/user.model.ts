export type UserRole = 'admin' | 'customer' | 'guest';

export interface User {
    uid: string;
    email: string;
    name: string;
    role: UserRole;
    phone?: string;
    address?: string;
    photoURL?: string;
    createdAt: Date;
    updatedAt: Date;
}
