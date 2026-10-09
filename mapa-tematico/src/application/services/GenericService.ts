import { IBaseRepository, IIncidentRepository, ISchoolRepository, IHospitalRepository, IDemographicRepository } from "@/core/domain/repositories/interfaces";
import { Incident, School, Hospital, DemographicData } from "@prisma/client";

// GenericService.ts
export class GenericService<T, ID = string> {
    constructor(protected repository: IBaseRepository<T, ID>) { }

    async create(data: any): Promise<T> {
        return this.repository.create!(data);
    }

    async update(id: ID, data: any): Promise<T> {
        return this.repository.update!(id, data);
    }

    async delete(id: ID): Promise<void> {
        return this.repository.delete!(id);
    }

    async getById(id: ID): Promise<T | null> {
        return this.repository.findById!(id);
    }

    async getAll(): Promise<T[]> {
        return this.repository.findAll!();
    }
}

// IncidentService.ts
export class IncidentService extends GenericService<Incident> {
    constructor(protected incidentRepo: IIncidentRepository) {
        super(incidentRepo);
    }

    async getActive(): Promise<Incident[]> {
        return this.incidentRepo.findActive();
    }
}

// SchoolService.ts
export class SchoolService extends GenericService<School> {
    constructor(protected schoolRepo: ISchoolRepository) {
        super(schoolRepo);
    }
}

// HospitalService.ts
export class HospitalService extends GenericService<Hospital> {
    constructor(protected hospitalRepo: IHospitalRepository) {
        super(hospitalRepo);
    }
}

// DemographicService.ts
export class DemographicService extends GenericService<DemographicData> {
    constructor(protected demographicRepo: IDemographicRepository) {
        super(demographicRepo);
    }
}
