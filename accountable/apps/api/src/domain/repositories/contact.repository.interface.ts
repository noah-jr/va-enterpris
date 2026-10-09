export type ContactRequestStatus = 'NEW' | 'CONTACTED' | 'CLOSED';

export interface ContactRequestEntity {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  message: string;
  status: ContactRequestStatus;
  createdAt: Date;
}

export interface CreateContactRequestData {
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  message: string;
}

export interface IContactRequestRepository {
  create(data: CreateContactRequestData): Promise<ContactRequestEntity>;
  list(params: { page: number; perPage: number }): Promise<{ items: ContactRequestEntity[]; total: number }>;
  updateStatus(id: string, status: ContactRequestStatus): Promise<ContactRequestEntity>;
}

export interface NewsletterSubscriberEntity {
  id: string;
  email: string;
  createdAt: Date;
  unsubscribedAt: Date | null;
}

export interface INewsletterRepository {
  findByEmail(email: string): Promise<NewsletterSubscriberEntity | null>;
  create(email: string): Promise<NewsletterSubscriberEntity>;
  resubscribe(id: string): Promise<NewsletterSubscriberEntity>;
}
