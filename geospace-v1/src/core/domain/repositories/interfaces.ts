// IBaseRepository.ts
export interface IBaseRepository<T, ID = string> {
  create?(data: any): Promise<T>;
  update?(id: ID, data: any): Promise<T>;
  delete?(id: ID): Promise<void>;
  findById?(id: ID): Promise<T | null>;
  findAll?(): Promise<T[]>;
}

// IUnitRepository.ts
import { Unit } from "@prisma/client";
export interface IUnitRepository extends IBaseRepository<Unit> {
  findBySector(sector: string): Promise<Unit[]>;
  updateStatus(id: string, status: string): Promise<Unit>;
}

// IRoadRepository.ts
import { Road } from "@prisma/client";
export interface IRoadRepository extends IBaseRepository<Road> {
  findByStatus(status: string): Promise<Road[]>;
}

// IIncidentRepository.ts
import { Incident } from "@prisma/client";
export interface IIncidentRepository extends IBaseRepository<Incident> {
  findActive(): Promise<Incident[]>;
  findPriority(priority: string): Promise<Incident[]>;
}
