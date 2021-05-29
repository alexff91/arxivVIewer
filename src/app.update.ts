import { Update, Ctx, Hears } from 'nestjs-telegraf';
import { TelegrafContext } from './interfaces/telegraf-context.interface';

@Update()
export class AppUpdate {
  @Hears('status')
  async hears(@Ctx() ctx: TelegrafContext) {
    await ctx.reply('Hey there!');
  }
}
