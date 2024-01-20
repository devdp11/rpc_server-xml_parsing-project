import { Controller, Get, Post, Param, Delete, NotFoundException, Query } from '@nestjs/common';
import { BrandsService } from './brand.service';

@Controller('brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) {}

    @Get()
    async findAll(
        @Query('page') page: number = 1,
        @Query('itemsPerPage') itemsPerPage: string = '5',
      ) {
        const [brands, totalBrands] = await this.brandsService.findAll(page, itemsPerPage);
    
        return {
          data: brands,
          total: totalBrands,
        };
      }

      @Get('country/:countryName')
      async findBrandByCountryEndpoint(
        @Param('countryName') countryName: string,
        @Query('page') page: number = 1,
        @Query('itemsPerPage') itemsPerPage: string = '5',
      ) {
        return this.brandsService.findBrandByCountryEndpoint(countryName, page, itemsPerPage);
      }

    @Get('id/:id')
    async findBrandsByIdEndpoint(@Param('id') id: string) {
        const brand = await this.brandsService.findBrandsByIdEndpoint(id);

        if (!brand) {
            throw new NotFoundException(`Brand with id ${id} not found.`);
        }

        return brand;
    }

    @Post('add/:name/:countryName')
    async addBrandEndpoint(
        @Param('name') name: string,
        @Param('countryName') countryName: string,
    ) {
        return this.brandsService.addBrandEndpoint(name, countryName);
    }

    @Delete(':id')
    async deleteBrandEndpoint(@Param('id') id: string) {
        return this.brandsService.deleteBrandEndpoint(id);
    }
}
