import { Controller, Get, Post, Param, Body, Delete, HttpException, HttpStatus, NotFoundException, Query } from '@nestjs/common';
import { VehiclesService } from './vehicle.service';

@Controller('vehicles')
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) {}

    @Get()
    async findAll(
        @Query('page') page: number = 1,
        @Query('itemsPerPage') itemsPerPage: string = '5',
    ) {
        try {
            const [vehicles, totalVehicles] = await this.vehiclesService.findAll(
                page,
                itemsPerPage,
            );

            const response = vehicles.map(vehicle => ({
                id: vehicle.id,
                brandName: vehicle.brand.name,
                modelName: vehicle.model.name,
                year: vehicle.year,
                horsepower: vehicle.horsepower,
                cylinders: vehicle.cylinders,
                doors: vehicle.doors,
                styleName: vehicle.style.name,
                highway_mpg: vehicle.highway_mpg,
                city_mpg: vehicle.city_mpg,
                popularity: vehicle.popularity,
                msrp: vehicle.msrp,
                createdOn: vehicle.createdOn,
                updatedOn: vehicle.updatedOn,
            }));

            return {
                data: response,
                total: totalVehicles,
            };
        } catch (error) {
            throw new HttpException('Error fetching vehicles', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }


    @Get('brand/:brandName')
    async findVehiclesByBrandEndpoint(@Param('brandName') brandName: string) {
        const vehicles = await this.vehiclesService.findVehiclesByBrandEndpoint(brandName);

        if (!vehicles) {
            throw new NotFoundException(`Vehicle with brand name ${brandName} not found.`);
        }

        const response = vehicles.map(vehicle => ({
            id: vehicle.id,
            brandName: vehicle.brand.name,
            modelName: vehicle.model.name,
            year: vehicle.year,
            horsepower: vehicle.horsepower,
            cylinders: vehicle.cylinders,
            doors: vehicle.doors,
            styleName: vehicle.style.name,
            highway_mpg: vehicle.highway_mpg,
            city_mpg: vehicle.city_mpg,
            popularity: vehicle.popularity,
            msrp: vehicle.msrp,
            createdOn: vehicle.createdOn,
            updatedOn: vehicle.updatedOn,
        }));

        return response;
    }

    @Post()
    async addVehicleEndpoint(@Body() data: any) {
        try {
            const addVehicle = await this.vehiclesService.addVehicleEndpoint(data);
            return addVehicle;
        } catch (error) {
            throw new HttpException('Error adding vehicle', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Delete(':id')
    async deleteVehicleEndpoint(@Param('id') id: string) {
        return this.vehiclesService.deleteVehicleEndpoint(id);
    }
}
