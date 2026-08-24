import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { LeaveStatus } from '@prisma/client';

@Injectable()
export class LeaveService {
  constructor(private readonly prisma: PrismaService) {}

  async applyLeave(guardId: string, startDate: string, endDate: string, reason: string) {
    return this.prisma.leaveRequest.create({
      data: {
        guardId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: LeaveStatus.PENDING,
      },
    });
  }

  async findAll() {
    return this.prisma.leaveRequest.findMany({
      include: {
        guard: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: LeaveStatus, approvedById?: string, approvalNotes?: string) {
    const leave = await this.prisma.leaveRequest.findUnique({ where: { id } });
    if (!leave) throw new NotFoundException('Leave request not found');

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approvedById,
        approvalNotes,
      },
    });
  }
}
