import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class BrandsService {
    private prisma = new PrismaClient();

    async findAll(page: number, itemsPerPage: string): Promise<[any[], number]> {
        const skip = (page - 1) * parseInt(itemsPerPage, 10);
        const take = parseInt(itemsPerPage, 10);
    
        const [brands, totalBrands] = await Promise.all([
          this.prisma.brand.findMany({
            include: {
              country: true,
            },
            skip,
            take,
          }),
          this.prisma.brand.count(),
        ]);
    
        return [brands, totalBrands];
    }

      async findBrandByCountryEndpoint(countryName: string, page: number, itemsPerPage: string): Promise<any[] | null> {
        const skip = (page - 1) * parseInt(itemsPerPage, 10);
        const take = parseInt(itemsPerPage, 10);
    
        const brandsWithCountry = await this.prisma.brand.findMany({
          include: {
            country: true,
          },
          where: {
            country: {
              name: countryName,
            },
          },
          skip,
          take,
        });
    
        return brandsWithCountry.map((brand) => ({
          id: brand.id,
          name: brand.name,
          countryName: brand.country.name,
          createdOn: brand.createdOn,
          updatedOn: brand.updatedOn,
        }));
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
