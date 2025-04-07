import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Interest } from './entities/interest.entity';
import { CreateInterestDto } from './dto/create-interest.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class InterestsService {
  constructor(
    @InjectRepository(Interest)
    private interestsRepository: Repository<Interest>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Interest[]> {
    return this.interestsRepository.find();
  }

  async findOne(id: number): Promise<Interest> {
    const interest = await this.interestsRepository.findOneBy({ id });
    if (!interest) {
      throw new NotFoundException(`Intérêt avec l'ID ${id} non trouvé`);
    }
    return interest;
  }

  async create(createInterestDto: CreateInterestDto): Promise<Interest> {
    const interest = this.interestsRepository.create(createInterestDto);
    return this.interestsRepository.save(interest);
  }

  async addInterestsToUser(userId: string, interestIds: number[]): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['interests'],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
    }

    const interests = await Promise.all(
      interestIds.map(async (id) => {
        const interest = await this.findOne(id);
        return interest;
      }),
    );

    // Initialiser le tableau des intérêts s'il n'existe pas encore
    if (!user.interests) {
      user.interests = [];
    }

    // Ajouter les nouveaux intérêts
    user.interests = [...user.interests, ...interests];

    return this.usersRepository.save(user);
  }

  async getUserInterests(userId: string): Promise<Interest[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['interests'],
    });

    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${userId} non trouvé`);
    }

    return user.interests || [];
  }

  async getRecommendedProjects(userId: string): Promise<string> {
    // Cette méthode devrait implémenter la logique de recommandation
    // basée sur les intérêts de l'utilisateur
    // Pour l'instant, elle renvoie juste un message
    const interests = await this.getUserInterests(userId);

    return `Projets recommandés pour l'utilisateur ${userId} basés sur ${interests.length} intérêts`;
  }
}