import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CameraComponent } from './screens/camera/camera.component';
import { MediaComponent } from './screens/media/media.component';
import { ProfileComponent } from './screens/profile/profile.component';
import { VehicleDetailsComponent } from './screens/vehicle-details/vehicle-details.component';
import { DashboardComponent } from './screens/dashboard/dashboard.component';
import { UploadComponent } from './screens/upload/upload.component';
import { OffenceReviewComponent } from './screens/offence-review/offence-review.component';
import { VideoTrimmerComponent } from './screens/video-trimmer/video-trimmer.component';

const routes: Routes = [
  {
    path: 'getstart',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
  { path: 'camera', component: CameraComponent },
  { path: 'details', component: VehicleDetailsComponent },
  { path: 'media', component: MediaComponent },
  { path: 'profile', component: ProfileComponent },
  { path:'dashboard',component:DashboardComponent},
  { path:'upload',component:UploadComponent},
  { path:'offence',component:OffenceReviewComponent},
  {path:'trim',component:VideoTrimmerComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
