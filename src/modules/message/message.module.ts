import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MessageService } from './message.service';

@Module({
  imports: [ConfigModule],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
