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

//   @Cron(CronExpression.EVERY_DAY_AT_12AM)
//   @Cron('5 * * * * *')
  @Cron(CronExpression.EVERY_DAY_AT_02PM)
  async publishArticles() {
    try {
      // Get articles
      const articles = await this.fetchArticles();
      console.log(articles);
      const articlesTitles: string[] = [];
      const articlesIds: string[] = [];
      for (let i = 0; i < articles.feed.entry.length; i++) {
         let id = articles.feed.entry[i].id;
         let title = articles.feed.entry[i].title.replace(/(\r\n|\n|\r)/gm, "");
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
    const cats = ["astro-ph","astro-ph.CO","astro-ph.EP",
    "astro-ph.GA","astro-ph.HE","astro-ph.IM","astro-ph.SR",
    "cond-mat.dis-nn","cond-mat.mes-hall","cond-mat.mtrl-sci",
    "cond-mat.other","cond-mat.quant-gas","cond-mat.soft",
    "cond-mat.stat-mech","cond-mat.str-el","cond-mat.supr-con",
    "cs.AI","cs.AR","cs.CC","cs.CE","cs.CG","cs.CL","cs.CR","cs.CV",
    "cs.CY","cs.DB","cs.DC","cs.DL","cs.DM","cs.DS","cs.ET","cs.FL",
    "cs.GL","cs.GR","cs.GT","cs.HC","cs.IR","cs.IT","cs.LG","cs.LO",
    "cs.MA","cs.MM","cs.MS","cs.NA","cs.NE","cs.NI","cs.OH","cs.OS",
    "cs.PF","cs.PL","cs.RO","cs.SC","cs.SD","cs.SE","cs.SI","cs.SY",
    "econ.EM","eess.AS","eess.IV","eess.SP","gr-qc","hep-ex","hep-lat",
    "hep-ph","hep-th","math.AC","math.AG","math.AP","math.AT","math.CA",
    "math.CO","math.CT","math.CV","math.DG","math.DS","math.FA","math.GM",
    "math.GN","math.GR","math.GT","math.HO","math.IT","math.KT","math.LO",
    "math.MG","math.MP","math.NA","math.NT","math.OA","math.OC","math.PR",
    "math.QA","math.RA","math.RT","math.SG","math.SP","math.ST","math-ph",
    "nlin.AO","nlin.CD","nlin.CG","nlin.PS","nlin.SI","nucl-ex","nucl-th",
    "physics.acc-ph","physics.ao-ph","physics.app-ph","physics.atm-clus",
    "physics.atom-ph","physics.bio-ph","physics.chem-ph","physics.class-ph",
    "physics.comp-ph","physics.data-an","physics.ed-ph","physics.flu-dyn",
    "physics.gen-ph","physics.geo-ph","physics.hist-ph","physics.ins-det",
    "physics.med-ph","physics.optics","physics.plasm-ph","physics.pop-ph",
    "physics.soc-ph","physics.space-ph","q-bio.BM","q-bio.CB","q-bio.GN",
    "q-bio.MN","q-bio.NC","q-bio.OT","q-bio.PE","q-bio.QM","q-bio.SC",
    "q-bio.TO","q-fin.CP","q-fin.EC","q-fin.GN","q-fin.MF","q-fin.PM",
    "q-fin.PR","q-fin.RM","q-fin.ST","q-fin.TR","quant-ph","stat.AP",
    "stat.CO","stat.ME","stat.ML","stat.OT","stat.TH"];

    const random = Math.floor(Math.random() * cats.length);
    console.log(random, cats[random]);
    const response = await got(
      `http://export.arxiv.org/api/query?search_query=cat:${cats[random]}&sortBy=lastUpdatedDate&sortOrder=descending`
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
