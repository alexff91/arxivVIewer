/* eslint-disable @typescript-eslint/no-var-requires */
import { Injectable } from '@nestjs/common';
import { DOMParser } from 'xmldom';
import { Cron, CronExpression } from '@nestjs/schedule';
import got from 'got/dist/source';
const { Translate } = require('@google-cloud/translate').v2;
import { MessageService } from '../message/message.service';

@Injectable()
export class ArxivService {
  constructor(private readonly messageService: MessageService) {}

  @Cron(CronExpression.EVERY_DAY_AT_12AM)
//   @Cron('5 * * * * *')
  async publishArticles() {
    try {
      // Get articles
      const articles = await this.fetchArticles();
      console.log(articles);
      const articlesTitles: string[] = [];
      const articlesIds: string[] = [];
      for (let i = 0; i < articles.feed.entry.length; i++) {
         let id = articles.feed.entry[i].id;
         let title = articles.feed.entry[i].title;
         let summary = articles.feed.entry[i].summary.substring(0, 150) + '...';
         title = `<b>${title}</b>\n📚 ${summary}`;
         articlesIds.push(id);
         articlesTitles.push(title);
      }
      // Publish them
      let publishText = 'Новые #Arxiv статьи на сегодня:\n\n';
      for (let i = 0; i < 3; i++) {
        publishText += `${articlesTitles[i]}\n🌐 ${articlesIds[i]}\n\n`;
      }
      publishText += '<i>подготовлено @ArxivArticlesDailyBot</i>';
      await this.messageService.sendMessage(publishText);
    } catch (error) {
      console.log(error);
    }
  }

  private async fetchArticles() {
    const response = await got(
      'http://export.arxiv.org/api/query?search_query=all:Artificial+Intelligence&sortBy=lastUpdatedDate&sortOrder=descending'
    );
    const doc = new DOMParser().parseFromString(response.body, 'application/xml');
    //return doc.getElementsByTagName('entry');

   // Intermediate obj
   var parser = require('fast-xml-parser');
   var jsonObj = parser.parse(response.body);
    return jsonObj;
  }

  private async getTitle(title: string) {
    const translate = new Translate();
    const [translation] = await translate.translate(title, 'ru');

    return `<b>${title}</b>\n📚 ${translation}`;
  }
}
