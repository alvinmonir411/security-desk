import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class GuardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: { locationId?: string; status?: string }) {
    return this.prisma.securityGuard.findMany({
      include: {
        user: true,
      },
      orderBy: { badgeNumber: 'asc' },
    });
  }

  async findOne(id: string) {
    const guard = await this.prisma.securityGuard.findUnique({
      where: { id },
      include: {
        user: true,
        assignments: {
          take: 10,
          orderBy: { date: 'desc' },
          include: { location: true, shift: true, post: true },
        },
        attendanceLogs: {
          take: 10,
          orderBy: { date: 'desc' },
        },
        leaveRequests: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!guard) throw new NotFoundException('Security Guard profile not found');
    return guard;
  }
}
