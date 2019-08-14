import { Injectable } from '@angular/core';

@Injectable()
export class RssService {

  public getRss(episodes) {
    return `<?xml version="1.0" encoding="utf-8"?>
    <rss version="2.0">
    <channel>
    <title>La Pointe Du Cul</title>
    <link>hhttps://cdn-lapointeducul.firebaseapp.com//</link>
    <description>La pointe du cul</description>
    <image>https://cdn-lapointeducul.firebaseapp.com/assets/lpdc.png</image>
    <copyright>2019 lpdc</copyright>
    <ttl>60</ttl>
    ${episodes.map(episode => this.getEpisodeRss(episode)).join('')}
    </channel>
    </rss>
    `;
  }

  private getEpisodeRss(episode) {
    return `
    <item>
    <title>${this.convertEntites(episode.title)}</title>
    <link>${this.convertEntites(episode.link)}</link>
    <guid>${this.convertEntites(episode.id)}</guid>
    <description>${this.convertEntites(episode.description)}</description>
    </item>
    `;
  }

  private convertEntites(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
  }
}