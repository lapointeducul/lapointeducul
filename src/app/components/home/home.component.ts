import { RssService } from './../_utils/rss.service';
import { CONFIG, APP_CONSTANTS } from './../../constants';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'lpdc-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [RssService]
})
export class HomeComponent implements OnInit {
  @ViewChild('fileInput') fileInput: ElementRef;

  public episodes = [];
  public uploadForm: FormGroup;
  public file: File;

  public showAuth = false;
  public authForm: FormGroup;
  public connected = false;

  public upload$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private rssService: RssService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    public sanitizer: DomSanitizer,
  ) {
    this.fetchEpisodes();

    this.authForm = this.formBuilder.group({
      password: '',
    });

    this.uploadForm = this.formBuilder.group({
      title: '',
      description: '',
      filename: '',
      userFile: null
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
      this.updateRss();
    }
  }

  public connect() {
    const password = this.authForm.get('password').value;
    firebase.auth().signInWithEmailAndPassword(CONFIG.ADMIN_EMAIL, password)
      .then(a => {
        this.connected = true;
        this.showAuth = false;
      })
      .catch((e => this.authForm.reset()));
  }

  public onSelectFile(event) {
    if (event.target.files && event.target.files.length > 0) {
      this.file = event.target.files[0];
      this.uploadForm.get('filename').setValue(this.file.name);
      let audio = <HTMLAudioElement>document.getElementById('audioUpload');
      audio.src = URL.createObjectURL(this.file)
      audio.load();
    }
  }

  public selectFile(): void {
    this.fileInput.nativeElement.click();
  }

  public sendFile() {
    const title = this.uploadForm.get('title').value;
    const description = this.uploadForm.get('description').value;
    const fileName = this.file.name;

    if (!title || !fileName.endsWith('.mp3') || this.file.size > 500000000) {
      return; // > 500 Mo
    }
    this.upload$.next(true);

    const audio: any = document.getElementById("audioUpload");
    const duration = Math.floor(audio.duration);
    const episodeMeta = {
      episode: this.episodes.length,
      title,
      description,
      fileName,
      duration,
      date: moment().format('L'),
    }
    
    const fileRef = firebase.storage().ref().child(`${APP_CONSTANTS.EPISODE_FOLDER}/${fileName}`);
    fileRef.put(this.file, { contentType: 'audio/mp3' })
      .then(async () => {
        await this.createEpisodeDoc(fileRef, episodeMeta);
        this.fetchEpisodes(true);
        this.upload$.next(false);
      });
  }

  private async createEpisodeDoc(fileRef, episodeMeta) {
    let error;
    let link;
    try {
      link = await fileRef.getDownloadURL();
    } catch (e) {
      error = e.message;
    }
    const episodesRef = firebase.firestore().collection(APP_CONSTANTS.FIRESTORE_EPISODES_COLLECTION);
    episodesRef.doc(episodesRef.doc().id).set({
      ...episodeMeta,
      link,
      error,
    })
  }

  public updateSpotifyLinks() {
    const episodesRef = firebase.firestore().collection(APP_CONSTANTS.FIRESTORE_EPISODES_COLLECTION);
    this.episodes.forEach(({ id, spotifyLink}) => {
      episodesRef.doc(id).update({
        spotifyLink,
      });
    })
  }

  public updateRss() {
    firebase.storage().ref().child(`rss`).put(new Blob([this.rssService.getRss(this.episodes)]), { contentType: 'rss+xml' });
  }
}
