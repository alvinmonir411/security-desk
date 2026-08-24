import { Controller, Post, Get, Body, Param, Patch } from '@nestjs/common';
import { RosterService } from './roster.service';
import { GenerateRosterDto, ReassignGuardDto, UpdateRosterStatusDto } from './dto/roster.dto';
import { RosterStatus } from '@prisma/client';

@Controller('api/v1/rosters')
export class RosterController {
  constructor(private readonly rosterService: RosterService) {}

  @Post('generate')
  async generateRoster(@Body() dto: GenerateRosterDto) {
    return this.rosterService.generateRoster(dto.date);
  }

  @Get(':date')
  async getRosterByDate(@Param('date') date: string) {
    return this.rosterService.getRosterByDate(date);
  }

  @Post(':id/reassign')
  async reassignGuard(@Param('id') rosterId: string, @Body() dto: ReassignGuardDto) {
    return this.rosterService.reassignGuard(rosterId, dto);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') rosterId: string, @Body() dto: UpdateRosterStatusDto) {
    return this.rosterService.updateStatus(rosterId, dto.status as RosterStatus);
  }
}
