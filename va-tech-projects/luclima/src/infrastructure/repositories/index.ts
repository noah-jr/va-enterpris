// Repository Implementations
export { PrismaUserRepository } from './prisma-user.repository';
export { PrismaSectorRepository } from './prisma-sector.repository';
export { PrismaServiceRepository } from './prisma-service.repository';
export { PrismaServiceRequestRepository } from './prisma-service-request.repository';
export { PrismaNewsletterRepository } from './prisma-newsletter.repository';
export { PrismaContactRepository } from './prisma-contact.repository';
export { PrismaProjectRepository } from './prisma-project.repository';
export { PrismaCategoryRepository } from './prisma-category.repository';
export { PrismaPostRepository } from './prisma-post.repository';
export { PrismaNewsletterCampaignRepository } from './prisma-newsletter-campaign.repository';

// Repository Instances (Singletons)
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaSectorRepository } from './prisma-sector.repository';
import { PrismaServiceRepository } from './prisma-service.repository';
import { PrismaServiceRequestRepository } from './prisma-service-request.repository';
import { PrismaNewsletterRepository } from './prisma-newsletter.repository';
import { PrismaContactRepository } from './prisma-contact.repository';
import { PrismaProjectRepository } from './prisma-project.repository';
import { PrismaCategoryRepository } from './prisma-category.repository';
import { PrismaPostRepository } from './prisma-post.repository';
import { PrismaNewsletterCampaignRepository } from './prisma-newsletter-campaign.repository';

export const userRepository = new PrismaUserRepository();
export const sectorRepository = new PrismaSectorRepository();
export const serviceRepository = new PrismaServiceRepository();
export const serviceRequestRepository = new PrismaServiceRequestRepository();
export const newsletterRepository = new PrismaNewsletterRepository();
export const contactRepository = new PrismaContactRepository();
export const projectRepository = new PrismaProjectRepository();
export const categoryRepository = new PrismaCategoryRepository();
export const postRepository = new PrismaPostRepository();
export const newsletterCampaignRepository = new PrismaNewsletterCampaignRepository();
