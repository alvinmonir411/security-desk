import { Controller, Post, Get, Body, Param, Patch } from '@nestjs/common';
import { LeaveService } from './leave.service';
import { LeaveStatus } from '@prisma/client';

@Controller('api/v1/leaves')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post()
  async applyLeave(@Body() body: { guardId: string; startDate: string; endDate: string; reason: string }) {
    return this.leaveService.applyLeave(body.guardId, body.startDate, body.endDate, body.reason);
  }

  @Get()
  async findAll() {
    return this.leaveService.findAll();
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: LeaveStatus; approvalNotes?: string; approvedById?: string }
  ) {
    return this.leaveService.updateStatus(id, body.status, body.approvedById, body.approvalNotes);
  }
}
