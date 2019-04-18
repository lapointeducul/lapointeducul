// <reference path="./rss-parser.d.ts" />

import { Injectable } from '@angular/core';
import * as Parser from 'rss-parser';

@Injectable()
export class RSSParserService {

  static async parse(url: string) {
    const parser = new Parser();
    const feed = await parser.parseURL(`${url}.rss`);
    return feed.items;
  }
}

/*
<p> <b>Feed URL:</b> {{rssParsed.feed.feedUrl}} </p>
<p> <b>Title:</b> {{rssParsed.feed.title}} </p>
<p> <b>Description:</b> {{rssParsed.feed.description}} </p>
<p> <b>{{rssParsed.feed.link}}</b> </p>
<strong> Entries: </strong>
<ul>
  <li *ngFor="let entry of rssParsed.feed.entries">
    <p> <b>Title:</b> {{entry.title}}
    <p> <b>Link:</b> {{entry.link}}
    <p> <b>Published Date:</b> {{entry.pubDate}}
    <p> <b>Creator:</b> {{entry.creator}}
    <p> <b>Content:</b> {{entry.content}}
    <p> <b>Content Snippet:</b> {{entry.contentSnippet}}
    <p> <b>Guid:</b> {{entry.guid}}
    <p> <b>Categories:</b>
      <strong *ngFor="let category of categories">
        {{category}}
      </strong>
    ISO Date: {{entry.isoDate}}
  </li>
</ul>
*/
