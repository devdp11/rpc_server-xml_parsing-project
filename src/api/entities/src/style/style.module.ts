import { Module } from '@nestjs/common';
import { StylesService } from './style.service';
import { StylesController } from './style.controller';

@Module({
  providers: [StylesService],
  controllers: [StylesController]
})
export class StylesModule {}
