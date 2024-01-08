import { Module } from '@nestjs/common';
import { VehiclesService } from './vehicle.service';
import { VehiclesController } from './vehicle.controller';

@Module({
  providers: [VehiclesService],
  controllers: [VehiclesController]
})
export class VehiclesModule {}
