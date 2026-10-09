// Domain Entities
export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    avatar?: string | null;
    qrCode?: string | null;
    sectorId?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    SECTOR_MANAGER = 'SECTOR_MANAGER',
    EDITOR = 'EDITOR',
    EMPLOYEE = 'EMPLOYEE',
}

export interface Sector {
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Service {
    id: string;
    name: string;
    description: string;
    image?: string;
    isActive: boolean;
    order: number;
    sectorId: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Project {
    id: string;
    title: string;
    description: string;
    images: string[];
    status: ProjectStatus;
    completedAt?: Date | null;
    sectorId: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum ProjectStatus {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    ARCHIVED = 'ARCHIVED',
}

export interface ServiceRequest {
    id: string;
    name: string;
    email: string;
    phone: string;
    description: string;
    attachment?: string | null;
    status: ServiceRequestStatus;
    serviceId: string;
    sectorId: string;
    assignedToId?: string | null;
    createdById?: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export enum ServiceRequestStatus {
    NEW = 'NEW',
    IN_ANALYSIS = 'IN_ANALYSIS',
    IN_EXECUTION = 'IN_EXECUTION',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
}

export interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    image?: string | null;
    status: PostStatus;
    metaTitle?: string | null;
    metaDescription?: string | null;
    categoryId: string;
    authorId: string;
    publishedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export enum PostStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Newsletter {
    id: string;
    email: string;
    isActive: boolean;
    subscribedAt: Date;
}

export interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    subject: string;
    message: string;
    isReplied: boolean;
    repliedAt?: Date | null;
    createdAt: Date;
}

export interface ChatMessage {
    id: string;
    message: string;
    senderId: string;
    createdAt: Date;
}

export interface NewsletterCampaign {
    id: string;
    subject: string;
    content: string;
    sentAt?: Date | null;
    createdAt: Date;
}
