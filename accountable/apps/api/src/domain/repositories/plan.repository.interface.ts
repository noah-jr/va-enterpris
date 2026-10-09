export interface PlanEntity {
  id: string;
  name: string;
  badge: string | null;
  description: string;
  priceMonthly: number | null;
  priceAnnual: number | null;
  currency: string;
  features: string[];
  ctaText: string;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreatePlanData {
  name: string;
  badge?: string | null;
  description: string;
  priceMonthly?: number | null;
  priceAnnual?: number | null;
  currency?: string;
  features: string[];
  ctaText: string;
  isPopular?: boolean;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdatePlanData = Partial<CreatePlanData>;

export interface IPlanRepository {
  findAllActive(): Promise<PlanEntity[]>;
  findAll(): Promise<PlanEntity[]>;
  findById(id: string): Promise<PlanEntity | null>;
  findByName(name: string): Promise<PlanEntity | null>;
  create(data: CreatePlanData): Promise<PlanEntity>;
  update(id: string, data: UpdatePlanData): Promise<PlanEntity>;
  softDelete(id: string): Promise<void>;
}
