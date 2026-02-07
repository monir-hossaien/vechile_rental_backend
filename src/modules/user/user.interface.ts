
export enum UserRole {
    ADMIN = "admin",
    CUSTOMER = "customer"
}

export interface User {
    id: number;
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    role: UserRole;
    created_at?: Date;
    updated_at?: Date;
}