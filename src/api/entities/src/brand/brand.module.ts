import { Module } from '@nestjs/common';
import { BrandsService } from './brand.service';
import { BrandsController } from './brand.controller';

@Module({
  providers: [BrandsService],
  controllers: [BrandsController]
})
export class BrandsModule {}
