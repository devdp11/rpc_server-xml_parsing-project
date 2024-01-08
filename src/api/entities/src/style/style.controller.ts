import { Controller, Get, Post, Delete, Param, NotFoundException } from '@nestjs/common';
import { StylesService } from './style.service';

@Controller('styles')
export class StylesController {
    constructor(private readonly stylesService: StylesService) {}

    @Get()
    async findAll() {
        return this.stylesService.findAll();
    }

    @Get('id/:id')
    async findStylesByIdEndpoint(@Param('id') id: string) {
        const style = await this.stylesService.findStylesByIdEndpoint(id);

        if (!style) {
            throw new NotFoundException(`Style with id ${id} not found.`);
        }

        return style;
    }

    @Post('add/:styleName')
    async addStyleEndpoint(
        @Param('styleName') styleName: string,
    ) {
        return this.stylesService.addStyleEndpoint(styleName);
    }

    @Delete(':id')
    async deleteStyleEndpoint(@Param('id') id: string) {
        return this.stylesService.deleteStyleEndpoint(id);
    }
}
