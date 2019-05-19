import * as moment from 'moment';
import { Component, ViewChild, ElementRef } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import * as sha256 from 'sha256';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { APP_CONSTANTS, CONFIG } from './constants';
// import * as RSS from 'rss';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('fileInput') fileInput: ElementRef;

  public episodes = [];
  public uploadForm: FormGroup;
  public file: File;

  public showUpload = false;

  public upload$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private formBuilder: FormBuilder) {
    const config = {
      apiKey: CONFIG.API_KEY,
      authDomain: 'cdn-lapointeducul.firebaseapp.com',
      databaseURL: 'https://cdn-lapointeducul.firebaseio.com',
      projectId: 'cdn-lapointeducul',
      storageBucket: 'cdn-lapointeducul.appspot.com',
      messagingSenderId: '402647607443'
    };
    firebase.initializeApp(config);

    this.fetchEpisodes();

    this.uploadForm = this.formBuilder.group({
      title: '',
      description: '',
      filename: '',
      password: '',
      userFile: null
    });
  }

  public fetchEpisodes() {
    this.episodes = [];
    firebase.firestore().collection(APP_CONSTANTS.FIRESTORE_COLLECTION).get()
      .then(({ docs }) => docs.map(async (doc) => {
        const { title, description, fileName, date } = doc.data();
        this.episodes.push({
          id: doc.id,
          title,
          description,
          fileName,
          date,
          link: await firebase.storage().ref().child(`${APP_CONSTANTS.STORAGE_FOLDER}/${fileName}`).getDownloadURL(),
        });
      }))
      .then(() => this.updateRss());
  }

  public updateRss() {
    /*const feed = new RSS({
      title: 'La Pointe Du Cul',
      description: 'La Pointe Du Cul',
      feed_url: 'https://cdn-lapointeducul.firebaseapp.com/rss.xml',
      site_url: 'https://cdn-lapointeducul.firebaseapp.com',
      image_url: 'https://cdn-lapointeducul.firebaseapp.com/assets/jpg.png',
      managingEditor: 'Corzeam',
      webMaster: 'monster',
      copyright: '2019 lpdc',
      language: 'fr',
      ttl: '60',
    });

    this.episodes.forEach(episode => {
      feed.item({
        title: episode.title,
        description: episode.description,
        url: episode.link, // link to the item
        author: 'Corzeam',
        date: episode.date,
        enclosure: { url: episode.link, file: episode.fileName },
      });
    })
    const xml = feed.xml();
    debugger;
    return xml;*/
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
    const password = this.uploadForm.get('password').value;
    const fileName = this.file.name;

    if (!title || !fileName.endsWith('.mp3') || this.file.size > 500000000 || sha256.x2(password) !== CONFIG.UPLOAD) {
      return; // > 500 Mo
    }
    this.upload$.next(true);
    firebase.storage().ref().child(`${APP_CONSTANTS.STORAGE_FOLDER}/${fileName}`)
      .put(this.file, {
        contentType: 'audio/mp3',
      })
      .then(() => {
        this.fetchEpisodes();
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

  public openTab(url: string) {
    window.open(url, '_blank');
  }
}
