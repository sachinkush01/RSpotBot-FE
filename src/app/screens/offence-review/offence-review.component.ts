import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { AppLauncher } from '@capacitor/app-launcher';
import { PopoverController } from '@ionic/angular';
import { VehicleDetailService } from 'src/app/service/vehicle-detail.service';
import { DitectionResponse } from '../detectionResponse ';
import { ModalController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { SocialSharingService } from 'src/app/service/social-sharing.service';
import { SettingPopoverComponent } from '../popover/setting-popover/setting-popover.component';
import { MatDialog } from '@angular/material/dialog';
import { SharePopoverComponent } from '../popover/share-popover/share-popover.component';
@Component({
  selector: 'app-offence-review',
  templateUrl: './offence-review.component.html',
  styleUrls: ['./offence-review.component.scss'],
})
export class OffenceReviewComponent implements OnInit {
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
  locationUrl: string = '';
  disabledShareButton: boolean = true;

  constructor(private popoverController: PopoverController,
    private vehicleService: VehicleDetailService,
    private socialSharing: SocialSharing,
    private geolocation: Geolocation,
    private modalController: ModalController,
    private file: File,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    this.vehicleType = 'Bike';
    // this.vehicleService.responseData$.subscribe((responseData) => {
    //   this.responseData = responseData;
    //   this.responseData = {
    //     vehicle: 'bike',
    //     'helmet detection': 'YES',
    //     'trippling detection': 'NO',
    //     'liscence plate number': 'AB89AB1234',
    //   };
      // this.vehicleType = responseData.vehicle;
      // FB.init({
      //   appId: 'YOUR_APP_ID',
      //   autoLogAppEvents: true,
      //   xfbml: true,
      //   version: 'v13.0'
      // });
    // });

    this.imageSource = this.vehicleService.getMediaInfo().mediaSource;
    // this.imageSource='https://assets.telegraphindia.com/telegraph/IMG_7028.jpg'
    console.log('Sachin' + this.imageSource);
  }

  async openSettings(ev: any) {
    const dialogRef = this.dialog.open(SettingPopoverComponent, {
      width: '200px',
      height: '100px',
      panelClass: 'mat-dialog'
    });
  }

  getCurrentLocation = async () => {
    const coordinates = await this.geolocation.getCurrentPosition({
      enableHighAccuracy: true,
    });

    console.log('Current position:', coordinates);
    this.locationUrl =
      'http://maps.google.com/maps/?q=' +
      coordinates.coords.latitude +
      ',' +
      coordinates.coords.longitude;
    console.log(this.locationUrl);
  };
  text: string='Flamenco'
  imgurl:string= 'https://cdn.pixabay.com/photo/2019/12/26/05/10/pink-4719682_960_720.jpg'
  link: string='https://link.medium.com/JA4amAHFJ5'
  ShareWhatsapp(){
    this.socialSharing.shareViaWhatsApp(this.text, this.imageSource, this.link)
  }
  async shareViaWhatsApp() {
    console.log("whatsapp")
    await this.getCurrentLocation();
    const helmetDetection = this.responseData['helmet detection'];
    const triplingDetection = this.responseData['trippling detection'];
    const licensePlateNumber = this.responseData['liscence plate number'];
    console.log("Whatsapp")
    const message = `Offence Review:
  Helmet Detection: ${helmetDetection}
  Tripling Detection: ${triplingDetection}
  License Plate Number: ${licensePlateNumber}
  License Plate Type: ${this.lPType}
  Extra Offence: ${this.extraOffence}
  Description: ${this.comment}
  Location: ${this.locationUrl}`;
    const sharingData = {
      text: message,
      files: [this.imageSource],
    };
    const sharingUrl = encodeURIComponent(message);
    const whatsappUrl = `whatsapp://send?text=${sharingUrl}`;
    const webWhatsappUrl = `https://wa.me/?text=${sharingUrl}`;

    this.openAppOrFallback(
      whatsappUrl,
      webWhatsappUrl,
      'whatsapp',
      sharingData
    );
  }

  async shareViaTwitter() {
    await this.getCurrentLocation();
    const helmetDetection = this.responseData['helmet detection'];
    const triplingDetection = this.responseData['trippling detection'];
    const licensePlateNumber = this.responseData['liscence plate number'];

    const message = `Offence Review:
    Helmet Detection: ${helmetDetection}
    Tripling Detection: ${triplingDetection}
    License Plate Number: ${licensePlateNumber}
    License Plate Type: ${this.lPType}
    Extra Offence: ${this.extraOffence}
    Description: ${this.comment}
    Location: ${this.locationUrl}`;
    // const mediaFile = await this.getFileFromUrl(this.imageSource, 'media_file');

    const sharingData = {
      text: message,
      files: [this.imageSource],
    };
    const sharingUrl = encodeURIComponent(message);
    const twitterUrl = `twitter://post?message=${sharingUrl}`;
    const webTwitterUrl = `https://twitter.com/intent/tweet?text=${sharingUrl}`;

    this.openAppOrFallback(twitterUrl, webTwitterUrl, 'twitter', sharingData);
  }

  async shareViaFacebook() {
    // await this.getCurrentLocation();
    const helmetDetection = this.responseData['helmet detection'];
    const triplingDetection = this.responseData['trippling detection'];
    const licensePlateNumber = this.responseData['liscence plate number'];

    const message = `Offence Review:
    Helmet Detection: ${helmetDetection}
    Tripling Detection: ${triplingDetection}
    License Plate Number: ${licensePlateNumber}
    License Plate Type: ${this.lPType}
    Extra Offence: ${this.extraOffence}
    Description: ${this.comment}
    Location: ${this.locationUrl}`;
    const sharingData = {
      text: message,
      files: [this.imageSource],
    };
    const sharingUrl = encodeURIComponent(message);
    const facebookUrl = `fb://post?text=${sharingUrl}`;
    const webFacebookUrl = `https://facebook.com/sharer/sharer.php?u=${sharingUrl}`;

    this.openAppOrFallback(
      facebookUrl,
      webFacebookUrl,
      'facebook',
      sharingData
    );

  }

  async openAppOrFallback(
    appUrl: string,
    webUrl: string,
    appName: string,
    sharingData?: any
  ) {
    try {
      if (sharingData) {
        console.log("Message", sharingData.text);
        console.log("Image", sharingData.files);
        console.log("Total data", sharingData);
      }

      const canLaunch = await AppLauncher.canOpenUrl({ url: appUrl });

      if (canLaunch.value) {
        if (sharingData) {
          const shareResult = await Share.share(sharingData);

          if (shareResult) {
            console.log(`${appName} sharing successful`);

          } else {
            console.error(`Error sharing via ${appName}`);
          }
        } else {
          await AppLauncher.openUrl({ url: appUrl });
        }
      } else {
        window.open(webUrl, '_system');
      }
    } catch (error) {
      console.error(`Error opening ${appName}:`, error);
    }
  }

  async shareOffence() {
    const dialogRef = this.dialog.open(SharePopoverComponent, {
      width: '200px',
      height: '100px',
      panelClass: 'mat-dialog'
    });
  }

  async cancel() {
    await this.modalController.dismiss();
  }
}
