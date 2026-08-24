import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.location.findMany({
      include: {
        posts: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findRequirements(dateStr?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    return this.prisma.locationRequirement.findMany({
      where: { date: targetDate },
      include: { location: true, shift: true },
    });
  }
}
