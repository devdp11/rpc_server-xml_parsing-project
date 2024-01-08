import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class BrandsService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        return this.prisma.brand.findMany({
            include: {
                country: true,
            },
        });
    }

    async findBrandByCountryEndpoint(countryName: string): Promise<any | null> {
        return this.prisma.brand.findMany({
            include: {
                country: true,
            },
            where: {
                country: {
                    name: countryName,
                },
            },
        });
    }

    async findBrandsByIdEndpoint(id: string): Promise<any | null> {
        return this.prisma.brand.findUnique({
            where: {
                id,
            },
        });
    }

    async addBrandEndpoint(name: string, countryName: string): Promise<any> {
        const existingBrand = await this.prisma.brand.findUnique({
            where: {
                name,
            },
        });
    
        if (existingBrand) {
            throw new ConflictException(`Brand with name ${name} already exists.`);
        }
    
        const country = await this.prisma.country.findUnique({
            where: {
                name: countryName,
            },
        });
    
        if (!country) {
            throw new NotFoundException(`Country with name ${countryName} not found.`);
        }
    
        return this.prisma.brand.create({
            data: {
                name,
                country_id: country.id,
            },
        });
    }

    async deleteBrandEndpoint(id: string): Promise<any> {
        return this.prisma.brand.delete({
            where: {
                id,
            },
        });
    }
}
