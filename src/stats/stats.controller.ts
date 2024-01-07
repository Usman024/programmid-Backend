import { Controller, Get, Request } from "@nestjs/common";
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}
  @Get()
  findOne(@Request() req: any) {
    return this.statsService.findOne(req.user.sub, req.user.role);
  }
}
