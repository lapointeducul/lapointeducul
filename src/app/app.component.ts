import { Component, ViewChild, ElementRef } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { APP_CONSTANTS } from './constants';

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

  public upload$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private formBuilder: FormBuilder) {
    const config = {
      apiKey: 'AIzaSyC92nZCkcEjSJM5bDpgY4Hmwtx9BM3RGdU',
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
      filename: '',
      userFile: null
    });
  }

  public fetchEpisodes() {
    this.episodes = [];
    firebase.firestore().collection(APP_CONSTANTS.FIRESTORE_COLLECTION).get()
      .then(({ docs }) => docs.map(async (doc) => {
        const { title, fileName } = doc.data();
        this.episodes.push({
          id: doc.id,
          title,
          fileName,
          link: await firebase.storage().ref().child(`${APP_CONSTANTS.STORAGE_FOLDER}/${fileName}`).getDownloadURL(),
        });
      }));
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
    const fileName = this.file.name;
    if (!title || !fileName.endsWith('.mp3') || this.file.size > 500000000) {
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
      title,
      fileName,
    });
  }
}
