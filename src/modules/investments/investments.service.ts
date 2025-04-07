import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Investment } from './entities/investment.entity';
import { CreateInvestmentDto } from './dto/create-investment.dto';
import { UserRole } from '../users/types-dto/user-role.type';

@Injectable()
export class InvestmentsService {
  constructor(
    @InjectRepository(Investment)
    private investmentRepository: Repository<Investment>,
  ) {}

  async create(createInvestmentDto: CreateInvestmentDto, userId: string): Promise<Investment> {
    const investment = this.investmentRepository.create({
      ...createInvestmentDto,
      investorId: userId,
    });
    return this.investmentRepository.save(investment);
  }

  async findAllByInvestor(investorId: string): Promise<Investment[]> {
    return this.investmentRepository.find({
      where: { investorId },
      relations: ['project'],
    });
  }

  async findByProject(projectId: string, user: any): Promise<Investment[]> {
    const investments = await this.investmentRepository.find({
      where: { projectId },
      relations: ['investor', 'project'],
    });

    // Vérifier que l'utilisateur a le droit de voir ces investissements
    // Si c'est l'entrepreneur qui possède le projet, un admin, ou l'investisseur lui-même
    if (
      user.role === UserRole.ADMIN ||
      investments.some(inv => inv.project?.ownerId === user.id) ||
      investments.some(inv => inv.investorId === user.id)
    ) {
      return investments;
    }

    throw new ForbiddenException(
      'Vous n\'avez pas les droits pour voir ces investissements',
    );
  }

  async remove(id: string, userId: string): Promise<void> {
    const investment = await this.investmentRepository.findOne({
      where: { id },
      relations: ['investor'],
    });

    if (!investment) {
      throw new NotFoundException(`Investissement avec l'ID ${id} non trouvé`);
    }

    if (investment.investorId !== userId) {
      throw new ForbiddenException(
        'Vous ne pouvez annuler que vos propres investissements',
      );
    }

    await this.investmentRepository.delete(id);
  }
}