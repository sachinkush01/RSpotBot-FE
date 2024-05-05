import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, ModalOptions } from '@ionic/angular';
import { CommonService } from 'src/app/service/common.service';
import { AuthService } from '../../service/auth.service';
import { OtpComponent } from '../otp/otp.component';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
})
export class SigninComponent {
  phoneNumber: string = '';

  constructor(
    private readonly router: Router, // will be removed in the future.
    private readonly modalCtrl: ModalController,
    private readonly authService: AuthService,
    private readonly commonService: CommonService
  ) {}

  async sendOtp() {
    console.log('phoneNumber:', this.phoneNumber);

    if (this.phoneNumber) {
      if (!/^\d{10}$/.test(this.phoneNumber)) {
        this.commonService.presentAlert(
          'Failed!',
          'Please enter a valid Indian phone number.'
        );
        return;
      }

      this.commonService.simpleLoader('Please wait...');

      this.authService.signInWithPhoneNumber('+91' + this.phoneNumber).then(
        async (response) => {
          this.commonService.dismissLoader();
          console.log(response);

          if (response) {
            this.commonService.presentToast('OTP send successful.', 3000);
            this.authService.setResponseData(this.phoneNumber);

            const options: ModalOptions = {
              component: OtpComponent,
              componentProps: {
                phone: this.phoneNumber,
              },
            };

            const modal = await this.modalCtrl.create(options);
            await modal.present();
            const data = await modal.onWillDismiss();

            if (data.role === 'backdrop') {
              console.log(data);
            }
          } else {
            this.phoneNumber = '';
            this.commonService.presentToast(
              'Failed to send OTP. Please try again later.',
              3000
            );
            this.commonService.dismissLoader();
          }
        },
        () => {
          this.commonService.dismissLoader();
          this.commonService.presentToast(
            'Something went wrong! Please try again later.',
            5000
          );
        }
      );
    } else {
      this.commonService.presentAlert('Failed!', 'Please enter phone number.');
    }
  }

// will be removed in the future.
  toDetail() {
    this.router.navigate(['/camera']);
  }
}
