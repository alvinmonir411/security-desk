import { Controller, Get, Param, Query } from '@nestjs/common';
import { GuardsService } from './guards.service';

@Controller('api/v1/guards')
export class GuardsController {
  constructor(private readonly guardsService: GuardsService) {}

  @Get()
  async findAll(@Query('locationId') locationId?: string, @Query('status') status?: string) {
    return this.guardsService.findAll({ locationId, status });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.guardsService.findOne(id);
  }
}
