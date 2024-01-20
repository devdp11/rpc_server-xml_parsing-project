import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class StylesService {
    private prisma = new PrismaClient();

    async findAll(page: number, itemsPerPage: string): Promise<[any[], number]> {
        const skip = (page - 1) * parseInt(itemsPerPage, 10);
        const take = parseInt(itemsPerPage, 10);
    
        const [styles, totalStyles] = await Promise.all([
          this.prisma.style.findMany({
            skip,
            take,
          }),
          this.prisma.style.count(),
        ]);
    
        return [styles, totalStyles];
      }

    async findStylesByIdEndpoint(id: string): Promise<any | null> {
        return this.prisma.style.findUnique({
            where: {
                id,
            },
        });
    }

    async addStyleEndpoint(styleName: string): Promise<any> {
        const existingStyle = await this.prisma.style.findUnique({
            where: {
                name: styleName,
            },
        });
    
        if (existingStyle) {
            throw new ConflictException(`Style with name ${styleName} already exists.`);
        }

        return this.prisma.style.create({
            data: {
                name: styleName,
            },
        });
    }

    async deleteStyleEndpoint(id: string): Promise<any> {
        return this.prisma.style.delete({
            where: {
                id,
            },
        });
    }
}