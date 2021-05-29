/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import cheerio from 'cheerio';
import got from 'got/dist/source';
import { sampleSize } from 'lodash';
const { Translate } = require('@google-cloud/translate').v2;
import { MessageService } from '../message/message.service';

@Injectable()
export class ArxivService {
  constructor(private readonly messageService: MessageService) {}

  @Cron(CronExpression.EVERY_DAY_AT_8PM)
  async publishArticles() {
    try {
      // Get articles
      const articles = await this.fetchArticles();
      const articlesTitles: string[] = [];
      for (const article of articles) {
        const title = this.getTitle(article.title);
        articlesTitles.push(title);
      }
      // Publish them
      let publishText =
        'Новые #Arxiv статьи на сегодня:\n\n';
      for (let i = 0; i < 3; i++) {
        publishText += `${articlesTitles[i]}\n🌐 ${articles[i].id}\n\n`;
      }
      publishText += '<i>подготовлено @ArxivArticlesDailyBot</i>';
      await this.messageService.sendMessage(publishText);
    } catch (error) {
      console.log(error);
    }
  }

  private fetchArticles() {
    const response = got(
      'http://export.arxiv.org/api/query?search_query=all:Physics',
    );
    var parser = new DOMParser();
    var doc = parser.parseFromString(response.body, "application/xml");
    return doc.querySelectorAll('entry');
  }

  private async getTitle(title: string) {
    const translate = new Translate();
    const [translation] = await translate.translate(title, 'ru');

    return `<b>${title}</b>\n📚 ${translation}`;
  }
}
