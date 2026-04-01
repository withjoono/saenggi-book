import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { SetukBuilderController } from './setuk-builder.controller';
import { SetukBuilderService } from './setuk-builder.service';

@Module({
    imports: [HttpModule, ConfigModule],
    controllers: [SetukBuilderController],
    providers: [SetukBuilderService],
    exports: [SetukBuilderService],
})
export class SetukBuilderModule {}
