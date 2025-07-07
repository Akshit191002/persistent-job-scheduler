import { Controller, Post, Body, Put, Get } from '@nestjs/common';
import { JobService } from './jobs.service';
import { CreateJobDto } from './dto/createJob.dto';
import { get } from 'http';


@Controller('api')
export class SignupController {
    constructor(private readonly jobService: JobService) { }

    @Post('create')
    async create(@Body() createJobDto: CreateJobDto) {
        await this.jobService.create(createJobDto);
        return { message: 'Job created' };
    }

    @Put('update/:id')
    async update(@Body('id') id: number, @Body('status') status: string) {
        await this.jobService.update(id, status);
        return { message: 'Job updated' };
    }

    @Get()
    async get() {
        const jobs = await this.jobService.getDueJobs();
        return { jobs };
    }
}
