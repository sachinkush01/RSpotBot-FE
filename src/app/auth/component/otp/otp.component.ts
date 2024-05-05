import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CommonService } from 'src/app/service/common.service';
import { StorageService } from 'src/app/service/storage.service';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss'],
})
export class OtpComponent implements OnInit {
  otp: string = '';
  otpError: boolean = false;
  @Input() phone: string = '';
  timer: number = 30;
  isResendButtonDisabled: boolean = false;
  isResendLinkClicked: boolean = false;

  config = {
    otpLength: 6,
    autofocus: true,
    classList: {
      inputBox: 'my-super-box-class',
      input: 'my-super-class',
      inputFilled: 'my-super-filled-class',
      inputDisabled: 'my-super-disable-class',
      inputSuccess: 'my-super-success-class',
      inputError: 'my-super-error-class',
    },
  };

  constructor(
    private readonly modalController: ModalController,
    private readonly commonService: CommonService,
    private readonly authService: AuthService,
    private readonly storageService: StorageService
  ) {}
  ngOnInit(){
  this.startTimer();
  }

  dismiss() {
    this.modalController.dismiss();
  }

  handleFillEvent(value: string): void {
    this.otp = value;
  }

  startTimer() {
    this.isResendButtonDisabled = true;
    const interval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(interval);
        this.isResendButtonDisabled = false;
        this.timer = 30; // Reset the timer to its initial value
      }
    }, 1000);
  }

  async resendOtp() {
    const phoneNumber = '+91' + this.phone;
    console.log(phoneNumber);

    this.commonService.simpleLoader(
      'Please wait while we are sending OTP to ' + phoneNumber
    );
    this.authService.signInWithPhoneNumber(phoneNumber).then(
      (response) => {
        this.commonService.dismissLoader();
        if (response) {
          this.otp = '';
          this.otpError = false;
          this.commonService.presentToast('OTP send successful.', 3000);
          this.authService.setResponseData(phoneNumber);
          this.startTimer();
          this.isResendLinkClicked = true;
        } else {
          this.otp = '';
          this.otpError = false;
          this.commonService.presentToast(
            'Failed to send OTP. Please try again later.',
            3000
          );
        }
      },
      () => {
        this.otp = '';
        this.otpError = false;
        this.commonService.presentToast(
          'Something went wrong! Please try again later.',
          5000
        );
      }
    );
  }

  async verifyOTP() {
    if (this.otp) {
      if (this.otp.length != 6) {
        this.otp = '';
        this.otpError = true;
        this.commonService.presentToast('Please enter a valid OTP.', 3000);
        return;
      }

      this.commonService.simpleLoader('Please wait...');

      this.authService.verifiedOTP(this.otp).then(
        (response) => {
          this.otp = '';
          this.otpError = false;
          this.postValidNumber();
          this.commonService.dismissLoader();
        },
        (error) => {
          this.commonService.dismissLoader();
          if (error.code === 'auth/invalid-verification-code') {
            this.otp = '';
            this.otpError = true;
            this.commonService.presentToast('Please enter a valid OTP.', 3000);
          } else {
            this.otp = '';
            this.otpError = false;
            this.commonService.presentToast(
              'Something went wrong! Please try again later.',
              5000
            );
          }
        }
      );
    } else {
      this.commonService.presentAlert('Failed!', 'Please enter OTP.');
    }
  }

  postValidNumber() {
    this.authService.postPhoneNumber('+91' + this.phone).subscribe(
      (response) => {
        this.dismiss();
        if (response) {
          this.authService.setResponseData(this.phone);
          this.storageService.setPreference('userPhoneNumber', this.phone);
          this.commonService.navCtrl.navigateRoot(['/camera']);
          this.commonService.presentToast('OTP verification successful.', 3000);
        } else {
          this.dismiss();
          this.commonService.navCtrl.navigateRoot(['']);
          this.commonService.presentToast(
            'Something went wrong! Please try again later.',
            5000
          );
        }
      },
      () => {
        this.dismiss();
        this.storageService.clearPreference();
        this.commonService.navCtrl.navigateRoot(['']);
        this.commonService.presentToast(
          'Something went wrong! Please try again later.',
          5000
        );
      }
    );
  }
}
