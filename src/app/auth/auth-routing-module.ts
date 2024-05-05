import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SigninComponent } from './component/signin/signin.component';
import { GetStartComponent } from './component/get-start/get-start.component';
import { OtpComponent } from './component/otp/otp.component';

const routes: Routes = [
  {path:'',component:GetStartComponent},
  {
    path: 'signin',
    component: SigninComponent,
  },
  {
    path:'otp',
    component:OtpComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
