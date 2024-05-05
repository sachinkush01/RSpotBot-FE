import { Component, OnInit } from '@angular/core';
import { DitectionResponse } from '../../detectionResponse ';
import { VehicleDetailService } from 'src/app/service/vehicle-detail.service';
import { Offenses } from 'src/app/class/offences.model';

@Component({
  selector: 'app-bike',
  templateUrl: './bike.component.html',
  styleUrls: ['./bike.component.scss'],
})
export class BikeComponent  implements OnInit {
  openedFromDetailsPage = true;
  responseData!: DitectionResponse;
  isActive: boolean = false;
  vehicleType!: string;
  imageSource!: any;
  editingLicensePlate: boolean = false;
  editedLicensePlate: string = '';
  lPType: string = 'AI generated';
  extraOffence: any;

  offenses: Offenses = new Offenses();

  constructor(  private vehicleService: VehicleDetailService) { }

  ngOnInit() {
    this.vehicleService.responseData$.subscribe((responseData) => {
      this.responseData = responseData;
      // this.offenses.helmetDetection = this.responseData['helmet detection'] === 'YES';
      // this.offenses.triplingDetection = this.responseData['trippling detection'] === 'YES';
      // this.offenses.cellphoneUsage = this.responseData['cellphone detection'] === 'YES';
      // this.offenses.redLightJump = this.responseData['red light jump detection'] === 'YES';
      // this.offenses.blackSmokeEmission = this.responseData['black smoke emission detection'] === 'YES';
      // this.offenses.improperNumberPlate = this.responseData['improper number plate detection'] === 'YES';
      this.responseData = {
        vehicle: 'bike',
        'helmet detection': 'YES',
        'trippling detection': 'YES',
        'cellphone detection': 'YES',
        'red light jump detection': 'YES',
        'black smoke emission detection': 'NO',
        'improper number plate detection': 'YES',
        'liscence plate number': 'AB89AB1234',
      };
  });
  this.offenses.helmetDetection = this.responseData['helmet detection'] === 'YES';
      this.offenses.triplingDetection = this.responseData['trippling detection'] === 'YES';
      this.offenses.cellphoneUsage = this.responseData['cellphone detection'] === 'YES';
      this.offenses.redLightJump = this.responseData['red light jump detection'] === 'YES';
      this.offenses.blackSmokeEmission = this.responseData['black smoke emission detection'] === 'YES';
      this.offenses.improperNumberPlate = this.responseData['improper number plate detection'] === 'YES';
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
