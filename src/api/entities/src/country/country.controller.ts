import { Controller, Get, Post, Param } from '@nestjs/common';
import { CountriesService } from './country.service';

@Controller('countries')
export class CountriesController {
    constructor(private readonly countriesService: CountriesService) {}

    @Get()
    async findAll() {
        return this.countriesService.findAll();
    }

    @Post('add/:name')
    async addCountryEndpoint(
        @Param('name') name: string,
    ) {
        return this.countriesService.addCountryEndpoint(name);
    }
}