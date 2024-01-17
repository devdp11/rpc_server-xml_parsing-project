import { Controller, Get, Post, Param, Body, Delete, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { VehiclesService } from './vehicle.service';

@Controller('vehicles')
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) {}

    @Get()
    async findAll() {

        const vehicles = await this.vehiclesService.findAll();
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
