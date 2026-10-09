// Repository Interfaces (Ports)
import type {
    User,
    Sector,
    Service,
    Project,
    ServiceRequest,
    Post,
    Category,
    Newsletter,
    Contact,
    ChatMessage,
    NewsletterCampaign,
} from '../entities';

// User Repository
export interface IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findAll(filters?: UserFilters): Promise<User[]>;
    create(data: CreateUserDTO): Promise<User>;
    update(id: string, data: UpdateUserDTO): Promise<User>;
    delete(id: string): Promise<void>;
    count(filters?: UserFilters): Promise<number>;
}

export interface UserFilters {
    role?: string;
    sectorId?: string;
    isActive?: boolean;
    search?: string;
}

export interface CreateUserDTO {
    name: string;
    email: string;
    password: string;
    role?: string;
    sectorId?: string;
    avatar?: string;
}

export interface UpdateUserDTO {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    sectorId?: string;
    avatar?: string;
    isActive?: boolean;
    qrCode?: string;
}

// Sector Repository
export interface ISectorRepository {
    findById(id: string): Promise<Sector | null>;
    findByName(name: string): Promise<Sector | null>;
    findAll(filters?: SectorFilters): Promise<Sector[]>;
    create(data: CreateSectorDTO): Promise<Sector>;
    update(id: string, data: UpdateSectorDTO): Promise<Sector>;
    delete(id: string): Promise<void>;
}

export interface SectorFilters {
    isActive?: boolean;
}

export interface CreateSectorDTO {
    name: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdateSectorDTO {
    name?: string;
    description?: string;
    isActive?: boolean;
}

// Service Repository
export interface IServiceRepository {
    findById(id: string): Promise<Service | null>;
    findAll(filters?: ServiceFilters): Promise<Service[]>;
    create(data: CreateServiceDTO): Promise<Service>;
    update(id: string, data: UpdateServiceDTO): Promise<Service>;
    delete(id: string): Promise<void>;
}

export interface ServiceFilters {
    sectorId?: string;
    isActive?: boolean;
}

export interface CreateServiceDTO {
    name: string;
    description: string;
    image?: string;
    sectorId: string;
    order?: number;
    isActive?: boolean;
}

export interface UpdateServiceDTO {
    name?: string;
    description?: string;
    image?: string;
    sectorId?: string;
    isActive?: boolean;
    order?: number;
}

// Project Repository
export interface IProjectRepository {
    findById(id: string): Promise<Project | null>;
    findAll(filters?: ProjectFilters): Promise<Project[]>;
    create(data: CreateProjectDTO): Promise<Project>;
    update(id: string, data: UpdateProjectDTO): Promise<Project>;
    delete(id: string): Promise<void>;
}

export interface ProjectFilters {
    sectorId?: string;
    status?: string;
    userId?: string;
}

export interface CreateProjectDTO {
    title: string;
    description: string;
    images: string[];
    sectorId: string;
    userId: string;
    status?: string;
}

export interface UpdateProjectDTO {
    title?: string;
    description?: string;
    images?: string[];
    status?: string;
    completedAt?: Date;
}

// Service Request Repository
export interface IServiceRequestRepository {
    findById(id: string): Promise<ServiceRequest | null>;
    findAll(filters?: ServiceRequestFilters): Promise<ServiceRequest[]>;
    create(data: CreateServiceRequestDTO): Promise<ServiceRequest>;
    update(id: string, data: UpdateServiceRequestDTO): Promise<ServiceRequest>;
    delete(id: string): Promise<void>;
    count(filters?: ServiceRequestFilters): Promise<number>;
}

export interface ServiceRequestFilters {
    status?: string;
    sectorId?: string;
    assignedToId?: string;
}

export interface CreateServiceRequestDTO {
    name: string;
    email: string;
    phone: string;
    description: string;
    attachment?: string;
    serviceId: string;
    sectorId: string;
}

export interface UpdateServiceRequestDTO {
    status?: string;
    assignedToId?: string | null;
}

// Post Repository
export interface IPostRepository {
    findById(id: string): Promise<Post | null>;
    findBySlug(slug: string): Promise<Post | null>;
    findAll(filters?: PostFilters): Promise<Post[]>;
    create(data: CreatePostDTO): Promise<Post>;
    update(id: string, data: UpdatePostDTO): Promise<Post>;
    delete(id: string): Promise<void>;
}

export interface PostFilters {
    status?: string;
    categoryId?: string;
    authorId?: string;
}

export interface CreatePostDTO {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    image?: string;
    status?: string;
    metaTitle?: string;
    metaDescription?: string;
    categoryId: string;
    authorId: string;
}

export interface UpdatePostDTO {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    image?: string;
    status?: string;
    metaTitle?: string;
    metaDescription?: string;
    categoryId?: string;
    publishedAt?: Date;
}

// Category Repository
export interface ICategoryRepository {
    findById(id: string): Promise<Category | null>;
    findBySlug(slug: string): Promise<Category | null>;
    findAll(): Promise<Category[]>;
    create(data: CreateCategoryDTO): Promise<Category>;
    update(id: string, data: UpdateCategoryDTO): Promise<Category>;
    delete(id: string): Promise<void>;
}

export interface CreateCategoryDTO {
    name: string;
    slug: string;
}

export interface UpdateCategoryDTO {
    name?: string;
    slug?: string;
}

// Newsletter Repository
export interface INewsletterRepository {
    findByEmail(email: string): Promise<Newsletter | null>;
    findAll(filters?: NewsletterFilters): Promise<Newsletter[]>;
    create(email: string): Promise<Newsletter>;
    update(id: string, isActive: boolean): Promise<Newsletter>;
    delete(id: string): Promise<void>;
    count(): Promise<number>;
}

export interface NewsletterFilters {
    isActive?: boolean;
}

// Contact Repository
export interface IContactRepository {
    findById(id: string): Promise<Contact | null>;
    findAll(filters?: ContactFilters): Promise<Contact[]>;
    create(data: CreateContactDTO): Promise<Contact>;
    update(id: string, data: UpdateContactDTO): Promise<Contact>;
    delete(id: string): Promise<void>;
}

export interface ContactFilters {
    isReplied?: boolean;
}

export interface CreateContactDTO {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

export interface UpdateContactDTO {
    isReplied?: boolean;
    repliedAt?: Date;
}

// Chat Message Repository
export interface IChatMessageRepository {
    findAll(filters?: ChatMessageFilters): Promise<ChatMessage[]>;
    create(data: CreateChatMessageDTO): Promise<ChatMessage>;
    delete(id: string): Promise<void>;
}

export interface ChatMessageFilters {
    senderId?: string;
    limit?: number;
}

export interface CreateChatMessageDTO {
    message: string;
    senderId: string;
}

// Newsletter Campaign Repository
export interface INewsletterCampaignRepository {
    findById(id: string): Promise<NewsletterCampaign | null>;
    findAll(): Promise<NewsletterCampaign[]>;
    create(data: CreateNewsletterCampaignDTO): Promise<NewsletterCampaign>;
    update(id: string, sentAt: Date): Promise<NewsletterCampaign>;
}

export interface CreateNewsletterCampaignDTO {
    subject: string;
    content: string;
}
