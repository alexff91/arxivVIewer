import { Module } from '@nestjs/common';
import { MessageModule } from '../message/message.module';
import { ArxivService } from './arxiv.service';

@Module({
  imports: [MessageModule],
  providers: [ArxivService],
})
export class ArxivModule {}
