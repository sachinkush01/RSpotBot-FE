import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth, RecaptchaVerifier } from '@angular/fire/auth';
import { signInWithPhoneNumber } from 'firebase/auth';
import { environment } from 'src/environments/environment';

export const apiUrl: string = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  otpVerifier: any;
  confirmationResult: any;
  responseData: any;

  constructor(
    private readonly _fireAuth: Auth,
    private readonly http: HttpClient
  ) {}

  reCaptcha() {
    this.otpVerifier = new RecaptchaVerifier(
      'sign-in-button',
      {
        size: 'invisible',
        callback: (response: any) => {
          console.log(response);
        },
        'expired-callback': () => {},
      },
      this._fireAuth
    );
  }

  async signInWithPhoneNumber(phoneNumber: any) {
    try {
      if (!this.otpVerifier) this.reCaptcha();
      const confirmationResult = await signInWithPhoneNumber(
        this._fireAuth,
        phoneNumber,
        this.otpVerifier
      );
      this.confirmationResult = confirmationResult;
      return confirmationResult;
    } catch (error) {
      console.error(error);
      return null; // Return null or handle the error appropriately
    }
  }

  async verifiedOTP(otp: any) {
    try {
      if (!this.otpVerifier) this.reCaptcha();
      const result = await this.confirmationResult.confirm(otp);
      console.log(result);
      const user = result?.user;
      console.log(user);
    } catch (error) {
      console.error(error);
      throw error; // Return null or handle the error appropriately
    }
  }

  postPhoneNumber(phoneNumber: string) {
    const formData = new FormData();
    formData.append('phonenumber', phoneNumber);

    return this.http.post<any>(apiUrl + '/traffic/profile/all/', formData);
  }

  setResponseData(data: any) {
    this.responseData = data;
  }

  getResponseData() {
    return this.responseData;
  }
}
