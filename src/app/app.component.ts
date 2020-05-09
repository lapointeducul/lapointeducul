import { CONFIG } from './constants';
import { Component } from '@angular/core';
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

  constructor(
  ) {
    const config = {
      apiKey: CONFIG.API_KEY,
      authDomain: 'cdn-lapointeducul.firebaseapp.com',
      databaseURL: 'https://cdn-lapointeducul.firebaseio.com',
      projectId: 'cdn-lapointeducul',
      storageBucket: 'cdn-lapointeducul.appspot.com',
      messagingSenderId: '402647607443'
    };
    firebase.initializeApp(config);
  }

  public openTab(url: string) {
    window.open(url, '_blank');
  }
}
