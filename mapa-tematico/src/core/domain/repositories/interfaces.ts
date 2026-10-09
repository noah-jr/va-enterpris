// IBaseRepository.ts
export interface IBaseRepository<T, ID = string> {
  create?(data: any, options?: any): Promise<T>;
  update?(id: ID, data: any, options?: any): Promise<T>;
  delete?(id: ID): Promise<void>;
  findById?(id: ID, options?: any): Promise<T | null>;
  findAll?(options?: any): Promise<T[]>;
}

// IIncidentRepository.ts
import { Incident, School, Hospital, DemographicData } from "@prisma/client";

export interface IIncidentRepository extends IBaseRepository<Incident> {
  findActive(): Promise<Incident[]>;
  findPriority(priority: string): Promise<Incident[]>;
}

export interface ISchoolRepository extends IBaseRepository<School> {
  findByProvince(province: string): Promise<School[]>;
}

export interface IHospitalRepository extends IBaseRepository<Hospital> {
  findByProvince(province: string): Promise<Hospital[]>;
}

export interface IDemographicRepository extends IBaseRepository<DemographicData> {
  findByRegion(regionName: string, regionType: string): Promise<DemographicData[]>;
}

export interface IUserRepository extends IBaseRepository<any> {
  findByEmail(email: string): Promise<any | null>;
  findByEmailOrName(identifier: string): Promise<any | null>;
}

export interface IAuditLogRepository extends IBaseRepository<any> {
  findByUser(userId: string): Promise<any[]>;
}
