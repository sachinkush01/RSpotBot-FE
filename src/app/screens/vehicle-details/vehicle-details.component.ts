import { Component, OnInit } from '@angular/core';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { SocialSharing } from '@awesome-cordova-plugins/social-sharing/ngx';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { AppLauncher } from '@capacitor/app-launcher';
import { ActionSheetController, PopoverController } from '@ionic/angular';
import { VehicleDetailService } from 'src/app/service/vehicle-detail.service';
import { DitectionResponse } from '../detectionResponse ';
import { ModalController } from '@ionic/angular';
import { Share } from '@capacitor/share';
import { SocialSharingService } from 'src/app/service/social-sharing.service';
import { SettingPopoverComponent } from '../popover/setting-popover/setting-popover.component';
import { MatDialog } from '@angular/material/dialog';
declare var FB: any;

@Component({
  selector: 'app-vehicle-details',
  templateUrl: './vehicle-details.component.html',
  styleUrls: ['./vehicle-details.component.scss'],
})
export class VehicleDetailsComponent implements OnInit {
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

  constructor(
    private popoverController: PopoverController,
    private vehicleService: VehicleDetailService,
    private socialSharing: SocialSharing,
    private geolocation: Geolocation,
    private modalController: ModalController,
    private file: File,
    private share:SocialSharingService,
    private dialog: MatDialog,
    private actionSheetController: ActionSheetController
  ) {
    // this.twitterClient = new Twit({
    //   consumer_key: 'SjmsDRENXBDYN0j4D5R0RQ39y',
    //   consumer_secret: 'KBjLlmCzIJsWGeUPo2h0ogRgC4bqBj47bZgCuLcyqtYhJUYdWK',
    //   access_token: '1709133874339381249-Ny2SFw4JRw31LRkpVZ3Bpsci2FIGwq',
    //   access_token_secret: 'NivA12xIGkNCDTC3UevJ9swoWgvBqxDtFG2gN0oU4Iwav',
    // });
  }
  ngOnInit(): void {
    // this.vehicleType = 'Bike';
    // this.vehicleService.responseData$.subscribe((responseData) => {
    //   this.responseData = responseData;
    //   this.responseData = {
    //     'helmet detection': 'YES',
    //     'trippling detection': 'NO',
    //     'cellphone detection': 'YES',
    //     'red light jump detection': 'YES',
    //     'black smoke emission detection': 'NO',
    //     'improper number plate detection': 'YES',
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

    this.imageSource = this.vehicleService.getMediaInfo();
    // this.imageSource='https://assets.telegraphindia.com/telegraph/IMG_7028.jpg'
    console.log('Sachin' + this.imageSource);
  }
  async canDismiss(data?: any, role?: string) {
    return role !== 'gesture';
  }
  async openSettings(ev: any) {
    const dialogRef = this.dialog.open(SettingPopoverComponent, {
      width: '200px', 
      height:'100px',
      panelClass: 'mat-dialog'
    });
   
    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
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

  // async blobToDataURL(blobURL: string): Promise<string> {
  //   return new Promise<string>((resolve, reject) => {
  //     this.file
  //       .resolveLocalFilesystemUrl(blobURL)
  //       .then((entry) => {
  //         if (entry.isFile) {
  //           (entry as any).file(
  //             (file: Blob) => {
  //               const reader = new FileReader();
  //               reader.onloadend = () => {
  //                 resolve(reader.result as string);
  //               };
  //               reader.onerror = reject;
  //               reader.readAsDataURL(file);
  //             },
  //             (error: any) => {
  //               reject(error);
  //             }
  //           );
  //         } else {
  //           reject('Provided URL is not a file');
  //         }
  //       })
  //       .catch((error) => {
  //         reject(error);
  //       });
  //   });
  // }

  async shareViaWhatsApp() {
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
  

  // shareToTwitter() {
  //   const helmetDetection = this.responseData['helmet detection'];
  //   const triplingDetection = this.responseData['trippling detection'];
  //   const licensePlateNumber = this.responseData['liscence plate number'];

  //   const fileUrl = this.imageSource;

  //   const message = `Offence Review:
  //     Helmet Detection: ${helmetDetection}
  //     Tripling Detection: ${triplingDetection}
  //     License Plate Number: ${licensePlateNumber}
  //     License Plate Type: ${this.lPType}
  //     Extra Offence: ${this.extraOffence}
  //     Description: ${this.comment}
  //     Location: ${this.locationUrl}`;

  //   // Upload the image to Twitter first
  //   this.twitterClient.post(
  //     'media/upload',
  //     { media_url: fileUrl },
  //     (err: any, media: { media_id_string: any }, response: any) => {
  //       console.log(response);
  //       console.log(err);
  //       console.log(media);

  //       if (err) {
  //         console.error('Error uploading media to Twitter:', err);
  //         return;
  //       }

  //       // Now, post the tweet with the attached image
  //       this.twitterClient.post(
  //         'statuses/update',
  //         {
  //           status: message,
  //           media_ids: [media.media_id_string], // Attach the uploaded image
  //         },
  //         (err: any, tweet: any, response: any) => {
  //           console.log(response);
  //           console.log(err);
  //           console.log(tweet);

  //           if (err) {
  //             console.error('Error posting tweet to Twitter:', err);
  //             return;
  //           }

  //           console.log('Tweet posted successfully:', tweet);
  //         }
  //       );
  //     }
  //   );
  // }

  async cancel() {
    await this.modalController.dismiss(); 
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Albums',
      cssClass: 'my-custom-class',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        id: 'delete-button',
        data: {
          type: 'delete'
        },
        handler: () => {
          console.log('Delete clicked');
        }
      }, {
        text: 'Share',
        icon: 'share',
        data: 10,
        handler: () => {
          console.log('Share clicked');
        }
      }, {
        text: 'Play (open modal)',
        icon: 'caret-forward-circle',
        data: 'Data value',
        handler: () => {
          console.log('Play clicked');
        }
      }, {
        text: 'Favorite',
        icon: 'heart',
        handler: () => {
          console.log('Favorite clicked');
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();

    const { role, data } = await actionSheet.onDidDismiss();
    console.log('onDidDismiss resolved with role and data', role, data);
  }
}
