import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { HttpClientModule } from '@angular/common/http';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { LocationAccuracy } from '@awesome-cordova-plugins/location-accuracy/ngx';
import { MediaCapture } from '@awesome-cordova-plugins/media-capture/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
// import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { NgxOtpInputModule } from 'ngx-otp-input';
import { environment } from 'src/environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { CameraComponent } from './screens/camera/camera.component';
import { MediaComponent } from './screens/media/media.component';
import { ProfileComponent } from './screens/profile/profile.component';
import { VehicleDetailsComponent } from './screens/vehicle-details/vehicle-details.component';
import { DashboardComponent } from './screens/dashboard/dashboard.component';
import { UploadComponent } from './screens/upload/upload.component';
import { SettingPopoverComponent } from './screens/popover/setting-popover/setting-popover.component';
import { OffencePopoverComponent } from './screens/popover/offence-popover/offence-popover.component';
import { BikeComponent } from './screens/vehicle/bike/bike.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CarComponent } from './screens/vehicle/car/car.component';
import { OffenceReviewComponent } from './screens/offence-review/offence-review.component';
import { VideoTrimmerComponent } from './screens/video-trimmer/video-trimmer.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    CameraComponent,
    SettingPopoverComponent,
    VehicleDetailsComponent,
    MediaComponent,
    ProfileComponent,
    DashboardComponent,
    UploadComponent,
    OffencePopoverComponent,
    BikeComponent,
    CarComponent,
    OffenceReviewComponent,
    VideoTrimmerComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgxOtpInputModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    AuthModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    MatDialogModule
   
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: MediaCapture,
      useClass: MediaCapture,
    },
    File,
    SocialSharing,
    LocationAccuracy,
    HTTP,
    // AndroidPermissions,
    Geolocation,
    
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
