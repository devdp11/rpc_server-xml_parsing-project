import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class StylesService {
    private prisma = new PrismaClient();

    async findAll(): Promise<any[]> {
        return this.prisma.style.findMany();
    }

    async findStylesByIdEndpoint(id: string): Promise<any | null> {
        return this.prisma.style.findUnique({
            where: {
                id,
            },
        });
    }

    async addStyleEndpoint(styleName: string): Promise<any> {
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