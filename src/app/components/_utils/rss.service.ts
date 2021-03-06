import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable()
export class RssService {

  title = 'La Pointe Du Cul';
  url = 'https://lapointeducul.fr';
  avatar = 'https://lapointeducul.fr/assets/episode.png';
  order = 0;

  public getRss(episodes) {
    const rss = `<?xml version="1.0" encoding="utf-8"?>
    <rss xmlns:media="http://search.yahoo.com/mrss/"
          xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
          xmlns:dcterms="http://purl.org/dc/terms/"
          xmlns:spotify="http://www.spotify.com/ns/rss"
          xmlns:psc="http://podlove.org/simple-chapters/"
          xmlns:atom="http://www.w3.org/2005/Atom"
          version="2.0">
    <channel>
      <title>${this.title}</title>
      <link>${this.url}</link>
      <description>La pointe du cul c’est un podcast qui parle de cul. Plus précisément, de pratiques sexuelles dites alternatives, hors des sentiers battus. 
Pour autant, ce n’est pas un podcast prêchant l’élitisme d’une sexualité plus déviante que la moyenne. 
C’est un podcast qui essaie de montrer à quel point ces pratiques “différentes” ne sont ni plus ni moins valables que les autres, 
que les gens qui les pratiquent ne sont ni plus ni moins “normaux” que les autres. C’est un podcast à visée pédagogique et désacralisante, son but est d’explorer la sexualité,
d’aller dans les recoins, de montrer son incroyable diversité. ${this.url}</description>
      <language>fr</language>
      <itunes:author>Raphaël Guillemot</itunes:author>
      <itunes:owner>
        <itunes:email>lapointeducul@gmail.com</itunes:email>
      </itunes:owner>
      <itunes:category text="Arts">
        <itunes:category text="Performing Arts"/>
        <itunes:category text="Visual Arts"/>
      </itunes:category>
      <itunes:category text="Games &amp; Hobbies">
        <itunes:category text="Other Games"/>
        <itunes:category text="Hobbies"/>
      </itunes:category>
      <itunes:category text="Health">
        <itunes:category text="Sexuality"/>
      </itunes:category>
      <itunes:explicit>yes</itunes:explicit>
      <itunes:image href="${this.avatar}"/>
      <image>
        <link>${this.url}</link>
        <title>${this.title}</title>
        <url>${this.avatar}</url>
      </image>
      <copyright>2019 - lpdc</copyright>
      <ttl>60</ttl>
      <webMaster>lapointeducul@gmail.com (Romain Monsterlet)</webMaster>
      ${episodes.map(episode => this.getEpisodeRss(episode)).join('')}
      <atom:link href="https://firebasestorage.googleapis.com/v0/b/cdn-lapointeducul.appspot.com/o/rss?alt=media" rel="self" type="application/rss+xml" />
      </channel>
    </rss>
    `;
    return rss;
  }

  private getEpisodeRss(episode) {
    const title = this.encode(episode.title);
    const description = this.encode(episode.description, 'podcast-description');
    const link = this.encode(episode.link);
    const pubDate = moment(episode.date, 'DD/MM/YYYY').toDate().toUTCString();
    const item = `  <item>
        <guid isPermaLink="false">${episode.id}</guid>
        <author>lapointeducul@gmail.com (Raphaël Guillemot)</author>
        <title>${title}</title>
        <link>${this.url}</link>
        <media:content type="audio/mpeg" url="${link}" />
        <description>${description}</description>
        <itunes:explicit>yes</itunes:explicit>
        <itunes:image href="${this.avatar}" />
        <pubDate>${pubDate}</pubDate>
        <itunes:order>${++this.order}</itunes:order>
        <itunes:duration>${episode.duration}</itunes:duration>
        <enclosure url="${link}" length="${episode.duration}" type="audio/mpeg" />
      </item>
    `;
    return item;
  }

  private encode(str, extractClass?) {
    const p = document.createElement('p');
    p.textContent = str;
    if (extractClass) {
      p.innerHTML = str;
      if (p.getElementsByClassName(extractClass).length)
        return this.encode(p.getElementsByClassName(extractClass)[0].innerHTML);
    }
    return p.innerHTML;
  }
}
