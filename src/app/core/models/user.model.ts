import { Role } from "./role.model";

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    isActive: boolean;
    role: Role;
    createdAt?: string;
    updatedAt?: string;
}
