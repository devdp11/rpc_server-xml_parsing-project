import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class CountriesService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        return this.prisma.country.findMany();
    }

    async addCountryEndpoint(name: string): Promise<any> {
        const existingCountry = await this.prisma.country.findUnique({
            where: {
                name,
            },
        });
    
        if (existingCountry) {
            throw new ConflictException(`Country with name ${name} already exists.`);
        }
    
        return this.prisma.country.create({
            data: {
                name,
            },
        });
    }
}