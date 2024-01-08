// models.controller.ts

import { Controller, Get, Post, Delete, Param, NotFoundException } from '@nestjs/common';
import { ModelsService } from './model.service';

@Controller('models')
export class ModelsController {
    constructor(private readonly modelsService: ModelsService) {}

    @Get()
    async findAll() {
        const model = await this.modelsService.findAll();

        const response = model.map(model => ({
            id: model.id,
            name: model.name,
            brandName: model.brand.name,
            createdOn: model.createdOn,
            updatedOn: model.updatedOn,
        }));
        
        return response;
    }

    @Get('brand/:brandName')
    async findModelsByBrandEndpoint(@Param('brandName') brandName: string) {
        const model = await this.modelsService.findModelsByBrandEndpoint(brandName);

        if (!model) {
            throw new NotFoundException(`Model with brand name ${brandName} not found.`);
        }

        const response = model.map(model => ({
            id: model.id,
            name: model.name,
            brandName: model.brand.name,
            createdOn: model.createdOn,
            updatedOn: model.updatedOn,
        }));

        return response;
    }

    @Get('id/:id')
    async findModelsByIdEndpoint(@Param('id') id: string) {
        const model = await this.modelsService.findModelsByIdEndpoint(id);

        if (!model) {
            throw new NotFoundException(`Model with id ${id} not found.`);
        }

        return model;
    }

    @Post('add/:brandName/:modelName')
    async addModelEndpoint(
        @Param('brandName') brandName: string,
        @Param('modelName') modelName: string,
    ) {
        return this.modelsService.addModelEndpoint(brandName, modelName);
    }

    @Delete(':id')
    async deleteModelEndpoint(@Param('id') id: string) {
        return this.modelsService.deleteModelEndpoint(id);
    }
}
