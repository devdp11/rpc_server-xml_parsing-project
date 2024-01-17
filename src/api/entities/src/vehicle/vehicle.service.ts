import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class VehiclesService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        return this.prisma.vehicle.findMany({
            include: {
                brand: true,
                model: true,
                style: true,
            },
        });
    }

    async findVehiclesByBrandEndpoint(brandName: string): Promise<any | null> {
        return this.prisma.vehicle.findMany({
            include: {
                brand: true,
            },
            where: {
                brand: {
                    name: brandName,
                },
            },
        });
    }

    async addVehicleEndpoint(data: any): Promise<any> {
        try {
            const { brandName, modelName, styleName, year, horsepower, cylinders, doors, highway_mpg, city_mpg, popularity, msrp } = data;

            const brand = await this.prisma.brand.findUnique({
                where: { name: brandName },
            });
            
            if (!brand) {
                throw new NotFoundException(`Brand with name '${brandName}' not found.`);
            }

            const model = await this.prisma.model.findUnique({
                where: { name: modelName },
            });

            if (!model) {
                throw new NotFoundException(`Model with name '${modelName}' not found.`);
            }

            const style = await this.prisma.style.findUnique({
                where: { name: styleName },
            });

            if (!style) {
                throw new NotFoundException(`Style with name '${styleName}' not found.`);
            }

            const addVehicle = await this.prisma.vehicle.create({
                data: {
                    brand: { connect: { id: brand.id } },
                    model: { connect: { id: model.id } },
                    style: { connect: { id: style.id } },
                    year,
                    horsepower,
                    cylinders,
                    doors,
                    highway_mpg,
                    city_mpg,
                    popularity,
                    msrp,
                },
            });

            return addVehicle;
        } catch (error) {
            throw new HttpException('Error adding vehicle', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async deleteVehicleEndpoint(id: string): Promise<any> {
        return this.prisma.vehicle.delete({
            where: {
                id,
            },
        });
    }
}
