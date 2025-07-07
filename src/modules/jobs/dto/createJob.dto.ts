import { IsBoolean, IsString } from 'class-validator';

export class CreateJobDto {
    @IsString()
    name: string;

    @IsString()
    type: string;

    @IsString()
    parameters: any;

    @IsString()
    schedule: string;

    @IsBoolean()
    is_recurring: boolean;

    created_at?: Date;
}
