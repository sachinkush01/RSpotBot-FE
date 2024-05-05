import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';
import { StorageService } from './service/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(
    private readonly storageService: StorageService,
    private readonly navCtrl: NavController
  ) {}

  ngOnInit() {
    // this.initializeApp();
  }

  // initializeApp() {
  //   this.storageService
  //     .getPreference('userPhoneNumber')
  //     .then((value: string) => {
  //       if (value) {
  //         this.navCtrl.navigateRoot('/camera');
  //       } else {
  //         this.navCtrl.navigateRoot('');
  //       }
  //     });
  // }
}
