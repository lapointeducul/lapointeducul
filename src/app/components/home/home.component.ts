import { CONFIG, APP_CONSTANTS } from './../../constants';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, ViewChild, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { BehaviorSubject } from 'rxjs';
import { AdminComponent } from './admin/admin.component';

@Component({
  selector: 'lpdc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild('admin') admin: AdminComponent;

  public episodes = [];
  public showAuth = false;
  public authForm: FormGroup;
  public connected = false;

  public upload$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public WEBSITES = [
    { name: 'Spotify', url: 'https://bit.ly/LPDC-Spotify'},
    { name: 'Deezer', url: 'https://bit.ly/LPDC-Deezer'},
    { name: 'Apple podcast', url: 'https://bit.ly/LPDC-Apple'},
    { name: 'Google Podcast', url: 'https://bit.ly/LPDC-GoogleP'},
    { name: 'Podcast addict', url: 'https://bit.ly/LPDC-Paddict'},
    { name: 'Pocket Cast', url: 'https://bit.ly/LPDC-PocketC'},
    { name: 'Breaker', url: 'https://bit.ly/LPDC-Breaker'},
    { name: 'Castbox', url: 'https://bit.ly/LPDC-Castbox'},
    { name: 'Radio Public', url: 'https://bit.ly/LPDC-RadioP'},
    { name: 'Overcast', url: 'https://bit.ly/LPDC-Overcast'},
  ];

  constructor(
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    public sanitizer: DomSanitizer,
  ) {
    this.fetchEpisodes();

    this.authForm = this.formBuilder.group({
      password: '',
    });
  }

  public ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.showAuth = params.admin === 'true';
    });
  }

  public async fetchEpisodes(updateRss?) {
    this.episodes = [];
    const { docs } = await firebase.firestore().collection(APP_CONSTANTS.FIRESTORE_EPISODES_COLLECTION).orderBy('episode', 'desc').get();
    for (const doc of docs) {
      const { title, description, fileName, duration, date, link, spotifyLink } = doc.data();
      this.episodes.push({
        id: doc.id,
        title,
        description,
        fileName,
        duration,
        date,
        link,
        spotifyLink,
        spotifyLinkSanitized: this.sanitizer.bypassSecurityTrustResourceUrl(spotifyLink),
      });
    }
    if (updateRss) {
      this.admin.updateRss();
    }
  }

  public connect() {
    const password = this.authForm.get('password').value;
    firebase.auth().signInWithEmailAndPassword(CONFIG.ADMIN_EMAIL, password)
      .then(() => {
        this.connected = true;
        this.showAuth = false;
      })
      .catch((e => this.authForm.reset()));
  }

  public openTab(url: string) {
    window.open(url, '_blank');
  }
}
