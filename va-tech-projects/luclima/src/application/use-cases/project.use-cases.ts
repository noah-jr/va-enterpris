import type { IProjectRepository, CreateProjectDTO, UpdateProjectDTO, ProjectFilters } from '@/domain/repositories';
import type { Project } from '@/domain/entities';

export class ProjectUseCases {
    constructor(private projectRepository: IProjectRepository) {}

    async getProjectById(id: string): Promise<Project | null> {
        return this.projectRepository.findById(id);
    }

    async getAllProjects(filters?: ProjectFilters): Promise<Project[]> {
        return this.projectRepository.findAll(filters);
    }

    async createProject(data: CreateProjectDTO): Promise<Project> {
        return this.projectRepository.create(data);
    }

    async updateProject(id: string, data: UpdateProjectDTO): Promise<Project> {
        const project = await this.projectRepository.findById(id);
        if (!project) throw new Error('Projecto não encontrado');
        return this.projectRepository.update(id, data);
    }

    async deleteProject(id: string): Promise<void> {
        const project = await this.projectRepository.findById(id);
        if (!project) throw new Error('Projecto não encontrado');
        return this.projectRepository.delete(id);
    }
}
