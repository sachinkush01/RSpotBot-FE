import { Component, OnInit } from '@angular/core';
import { SettingPopoverComponent } from '../screens/popover/setting-popover/setting-popover.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  implements OnInit {

  constructor(private dialog: MatDialog) { }
  showPopover = false;

  ngOnInit() {}

  async openSettings(ev: any) {
    // this.showPopover = true;
    const dialogRef = this.dialog.open(SettingPopoverComponent, {
      width: '200px', 
      height:'100px',
      panelClass: 'mat-dialog',
      backdropClass:'popover-backdrop',
      position:{ top: '30px', right: '30px' },
      hasBackdrop:true,
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // this.showPopover = false;
    });
  }
  
}
