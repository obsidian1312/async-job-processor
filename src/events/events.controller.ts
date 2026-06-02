import { Controller, Get, Post } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
    constructor(
        private readonly eventsService: EventsService
    ) {}

    @Post('trigger')
    async trigger() {
        return await this.eventsService.createJob();
    }

    @Get('stats')
    async stats() {
        return await this.eventsService.getStats();
    }
}
