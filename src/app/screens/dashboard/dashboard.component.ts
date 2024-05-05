import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { SettingPopoverComponent } from 'src/app/screens/popover/setting-popover/setting-popover.component';
import { OffencePopoverComponent } from '../popover/offence-popover/offence-popover.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent  implements OnInit {
  modal: HTMLIonPopoverElement | null = null;
  isPopoverOpen = false;
  constructor( private readonly popoverController: PopoverController,
               public dialog: MatDialog
               ) { }

  ngOnInit() {}

  async openSettings(ev: any) {
    const dialogRef = this.dialog.open(SettingPopoverComponent, {
      width: '200px', // Set the width of the dialog
      height:'100px',
      panelClass: 'mat-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  
  async openModal(event: Event) {
    const modal = await this.popoverController.create({
      component: OffencePopoverComponent,
      cssClass: 'ion-custom-modal',
      event: event,
      translucent: true,
    });
  
    await modal.present();
    const { role } = await modal.onDidDismiss();
  }
  async close() {
    await this.popoverController.dismiss(); 
  }

  async dismissModal() {
    await this.popoverController.dismiss(); 
  }
}
