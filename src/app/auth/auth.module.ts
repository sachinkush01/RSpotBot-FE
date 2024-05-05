import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NgxOtpInputModule } from 'ngx-otp-input';
import { AuthRoutingModule } from './auth-routing-module';
import { OtpComponent } from './component/otp/otp.component';
import { SigninComponent } from './component/signin/signin.component';
import { GetStartComponent } from './component/get-start/get-start.component';

@NgModule({
  declarations: [SigninComponent, OtpComponent,GetStartComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    AuthRoutingModule,
    NgxOtpInputModule,
  ],
})
export class AuthModule {}
