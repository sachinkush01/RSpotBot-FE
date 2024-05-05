import { Component, OnInit } from '@angular/core';
import { VehicleDetailService } from 'src/app/service/vehicle-detail.service';
import { DitectionResponse } from '../../detectionResponse ';
import { Offenses } from 'src/app/class/offences.model';

@Component({
  selector: 'app-car',
  templateUrl: './car.component.html',
  styleUrls: ['./car.component.scss'],
})
export class CarComponent  implements OnInit {
  openedFromDetailsPage = true;
  responseData!: DitectionResponse;
  isActive: boolean = false;
  vehicleType!: string;
  imageSource!: any;
  editingLicensePlate: boolean = false;
  editedLicensePlate: string = '';
  lPType: string = 'AI generated';
  extraOffence: any;
  comment: string = '';
  offenses: Offenses = new Offenses();
  
  constructor(  private vehicleService: VehicleDetailService) { }

  ngOnInit() {
    this.vehicleService.responseData$.subscribe((responseData) => {
      this.responseData = responseData;
      this.responseData = {
        vehicle: 'bike',
        'helmet detection': 'YES',
        'trippling detection': 'NO',
        'cellphone detection': 'YES',
        'red light jump detection': 'YES',
        'black smoke emission detection': 'NO',
        'improper number plate detection': 'YES',
        'liscence plate number': 'AB89AB1234',
      };
  });
  }
  startEditingLicensePlate(): void {
    this.editingLicensePlate = true;
    this.editedLicensePlate =
      this.responseData?.['liscence plate number'] || '';
  }

  saveEditedLicensePlate(): void {
    this.responseData['liscence plate number'] = this.editedLicensePlate;
    if ((this.editingLicensePlate = true)) {
      this.lPType = 'Manually';
    }
    this.editingLicensePlate = false;
    console.log(this.responseData['liscence plate number']);
    console.log(this.lPType);
  }

  cancelEditingLicensePlate(): void {
    this.editingLicensePlate = false;
    this.editedLicensePlate = '';
    console.log(this.lPType);
  }

  handleImageClick(extraOffence: any) {
    this.extraOffence = extraOffence;
    console.log(extraOffence);
  }

}
