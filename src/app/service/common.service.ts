import { Injectable } from '@angular/core';
import {
  AlertController,
  LoadingController,
  NavController,
  ToastController,
} from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(
    public readonly loadingCtrl: LoadingController,
    public readonly toastCtrl: ToastController,
    public readonly alertCtrl: AlertController,
    public readonly navCtrl: NavController
  ) {}

  async presentAlert(headerMessage: string, message: string) {
    const alert = await this.alertCtrl.create({
      header: headerMessage,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log('onDidDismiss resolved with role', role);
  }

  async presentToast(message: string, time: number) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: time,
    });
    toast.present();
  }

  async presentLoading(message: string, time: number) {
    const loading = await this.loadingCtrl.create({
      cssClass: 'my-custom-class',
      message: message,
      duration: time,
    });
    await loading.present();

    const { role, data } = await loading.onDidDismiss();
    console.log('Loading dismissed!');

    await loading.addEventListener('ionLoadingWillPresent', (event: any) => {
      console.log('event:', event);
    });
  }

  simpleLoader(message: string) {
    this.loadingCtrl
      .create({
        spinner: 'crescent',
        message: message,
        cssClass: 'custom-loading',
      })
      .then((response) => {
        response.present();
      });
  }

  dismissLoader() {
    this.loadingCtrl
      .dismiss()
      .then((response) => {
        console.log('Loader closed!', response);
      })
      .catch((err) => {
        console.log('Error occured : ', err);
      });
  }
}
