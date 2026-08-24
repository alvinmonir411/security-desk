import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('api/v1/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  async checkIn(@Body() body: { guardId: string; locationId: string; shiftId: string }) {
    return this.attendanceService.checkIn(body.guardId, body.locationId, body.shiftId);
  }

  @Post(':id/check-out')
  async checkOut(@Param('id') id: string) {
    return this.attendanceService.checkOut(id);
  }

  @Get('muster-roll')
  async getDailyMusterRoll(@Query('date') date?: string, @Query('locationId') locationId?: string) {
    return this.attendanceService.getDailyMusterRoll(date, locationId);
  }
}
