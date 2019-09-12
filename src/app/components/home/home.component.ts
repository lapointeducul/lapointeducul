import { RssService } from './../_utils/rss.service';
import { CONFIG, APP_CONSTANTS } from './../../constants';
import * as moment from 'moment';
import { ActivatedRoute } from '@angular/router';
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import * as sha256 from 'sha256';
import { FormGroup, FormBuilder } from '@angular/forms';
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
    const { docs } = await firebase.firestore().collection(APP_CONSTANTS.FIRESTORE_COLLECTION).orderBy('episode', 'desc').get();
    for (const doc of docs) {
      const { title, description, fileName, date } = doc.data();
      this.episodes.push({
        id: doc.id,
        title,
        description,
        fileName,
        date,
      });
    }
    if (updateRss) {
      this.updateRss();
    }
  }

  public async getPodcast(episode) {
    try {
      episode.link = await firebase.storage().ref().child(`${APP_CONSTANTS.EPISODE_FOLDER}/${episode.fileName}`).getDownloadURL();
    } catch (e) {
      episode.error = e.message;
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
    firebase.storage().ref().child(`${APP_CONSTANTS.EPISODE_FOLDER}/${fileName}`).put(this.file, { contentType: 'audio/mp3' })
      .then(async () => {
        this.fetchEpisodes(true);
        this.upload$.next(false);
      });
    const episodesRef = firebase.firestore().collection(APP_CONSTANTS.FIRESTORE_COLLECTION);
    episodesRef.doc(episodesRef.doc().id).set({
      episode: this.episodes.length,
      title,
      description,
      fileName,
      date: moment().format('L'),
    });
  }

  public updateRss() {
    firebase.storage().ref().child(`rss`).put(new Blob([this.rssService.getRss(this.episodes)]), { contentType: 'rss+xml' });
  }
}
