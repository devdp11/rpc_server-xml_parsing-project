import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BrandsModule } from './brand/brand.module';
import { ModelsModule } from './model/model.module';
import { CountriesModule } from './country/country.module';
import { StylesModule } from './style/style.module';
import { VehiclesModule } from './vehicle/vehicle.module';
@Module({
  imports: [BrandsModule, ModelsModule, CountriesModule, StylesModule, VehiclesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
