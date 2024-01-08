import { Controller, Get, Post, Param, Delete, NotFoundException } from '@nestjs/common';
import { BrandsService } from './brand.service';

@Controller('brands')
export class BrandsController {
    constructor(private readonly brandsService: BrandsService) {}

    @Get()
    async findAll() {
        const brandsWithCountry = await this.brandsService.findAll();
        const response = brandsWithCountry.map(brand => ({
            id: brand.id,
            name: brand.name,
            countryName: brand.country.name,
            createdOn: brand.createdOn,
            updatedOn: brand.updatedOn,
        }));
        
        return response;
    }

    @Get('country/:countryName')
    async findBrandByCountryEndpoint(@Param('countryName') countryName: string) {
        const brand = await this.brandsService.findBrandByCountryEndpoint(countryName);

        if (!brand) {
            throw new NotFoundException(`Brand with country name ${countryName} not found.`);
        }

        const response = brand.map(brand => ({
            id: brand.id,
            name: brand.name,
            countryName: brand.country.name,
            createdOn: brand.createdOn,
            updatedOn: brand.updatedOn,
        }));

        return response;
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
