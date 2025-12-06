import { Role } from "./role.model";

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: Role;
}