import { Controller, Get, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('api/v1/locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  async findAll() {
    return this.locationsService.findAll();
  }

  @Get('requirements')
  async findRequirements(@Query('date') date?: string) {
    return this.locationsService.findRequirements(date);
  }
}
