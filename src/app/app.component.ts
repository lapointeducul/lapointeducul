import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'angular-bootstrap-md';
import { FormControl } from '@angular/forms';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public episodes = [];

  constructor() {
    const config = {
      apiKey: 'AIzaSyC92nZCkcEjSJM5bDpgY4Hmwtx9BM3RGdU',
      authDomain: 'cdn-lapointeducul.firebaseapp.com',
      databaseURL: 'https://cdn-lapointeducul.firebaseio.com',
      projectId: 'cdn-lapointeducul',
      storageBucket: 'cdn-lapointeducul.appspot.com',
      messagingSenderId: '402647607443'
    };
    firebase.initializeApp(config);

    const db = firebase.firestore();
    const storage = firebase.storage();

    db.collection('episodes').get()
      .then(({ docs }) => docs.map(async (doc) => {
        this.episodes.push({
          ...doc.data(),
          id: doc.id,
          link: await storage.ref().child(`LPDC/${doc.data().fileName}`).getDownloadURL(),
        });
      }));

    /**
     * function writeUserData(userId, name, email, imageUrl) {
  firebase.database().ref('users/' + userId).set({
    username: name,
    email: email,
    profile_picture : imageUrl
  });
}
     */
  }
}
