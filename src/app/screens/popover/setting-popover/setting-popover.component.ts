import { Component, OnInit } from '@angular/core';
import { NavController, PopoverController } from '@ionic/angular';
import { CommonService } from 'src/app/service/common.service';
import { StorageService } from 'src/app/service/storage.service';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
@Component({
  selector: 'app-setting-popover',
  templateUrl: './setting-popover.component.html',
  styleUrls: ['./setting-popover.component.scss'],
})
export class SettingPopoverComponent implements OnInit {
  constructor(
    private readonly popoverController: PopoverController,
    private readonly navCtrl: NavController,
    private readonly commonService: CommonService,
    private readonly storageService: StorageService,
    private router: Router,
    public dialogRef: MatDialogRef<SettingPopoverComponent>
  ) {}

  ngOnInit() {}

  // navigateToProfilePage() {
  //   this.popoverController.dismiss().then(() => {
  //     this.navCtrl.navigateBack('/profile');
  //   });
  // }

  // navigateToDashboard() {
  //   this.popoverController.dismiss().then(() => {
  //     this.navCtrl.navigateBack('/dashboard');
  //   });
  // }
  // navigateToSignIn() {
  //   this.popoverController.dismiss().then(() => {
  //     this.storageService.clearPreference().then(() => {
  //       this.navCtrl.navigateRoot(['/signin']);
  //       this.commonService.presentToast('Logged Out Successfully ...', 3000);
  //     });
  //   });
  // }

  navigateToProfilePage(): void {
    this.dialogRef.close(); 
    this.router.navigate(['/profile']); 
  }
  
  navigateToDashboard(): void {
    this.dialogRef.close(); 
    this.router.navigate(['/dashboard']); 
  }
  
  navigateToSignIn(): void {
    this.dialogRef.close(); 
    this.storageService.clearPreference().then(() => {
    this.router.navigate(['/signin']); 
    this.commonService.presentToast('Logged Out Successfully ...', 3000);
    });
  }
  
  
}
