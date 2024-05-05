import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-offence-popover',
  templateUrl: './offence-popover.component.html',
  styleUrls: ['./offence-popover.component.scss'],
})
export class OffencePopoverComponent  implements OnInit {

  constructor(private popoverController:PopoverController) { }

  ngOnInit( ) {}
  async close() {
    await this.popoverController.dismiss(); 
  }
}
