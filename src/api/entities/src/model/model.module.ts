import { Module } from '@nestjs/common';
import { ModelsService } from './model.service';
import { ModelsController } from './model.controller';

@Module({
  providers: [ModelsService],
  controllers: [ModelsController]
})
export class ModelsModule {}
