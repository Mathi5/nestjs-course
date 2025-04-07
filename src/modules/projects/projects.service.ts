import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UserRole } from '../users/types-dto/user-role.type';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    const project = this.projectsRepository.create({
      ...createProjectDto,
      ownerId: userId,
    });
    return this.projectsRepository.save(project);
  }

  async findAll(): Promise<Project[]> {
    return this.projectsRepository.find();
  }

  async findOne(id: string): Promise<Project> {
    const project = await this.projectsRepository.findOneBy({ id });
    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${id} non trouvé`);
    }
    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
    const project = await this.findOne(id);

    // Vérifier que l'utilisateur est bien le propriétaire du projet
    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez pas modifier un projet qui ne vous appartient pas',
      );
    }

    await this.projectsRepository.update(id, updateProjectDto);
    return this.findOne(id);
  }

  async remove(id: string, userId: string, userRole: string): Promise<void> {
    const project = await this.findOne(id);

    // Vérifier que l'utilisateur est soit le propriétaire, soit un admin
    if (project.ownerId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'Vous ne pouvez pas supprimer un projet qui ne vous appartient pas',
      );
    }

    await this.projectsRepository.delete(id);
  }
}