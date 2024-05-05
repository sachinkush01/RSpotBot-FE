import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  Camera,
  CameraPhoto,
  CameraResultType,
  CameraSource,
} from '@capacitor/camera';
import { NavController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/service/auth.service';
import { CommonService } from 'src/app/service/common.service';
import { ProfileService } from 'src/app/service/profile.service';
import { StorageService } from 'src/app/service/storage.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  name: string = "John Doe";
  email: string = "johndoe@example.com";
  phonenumber:string = "8433112543";
  address: string = "123 Main Street, Anytown, USA";

  openedFromCameraPage!: boolean;
  openedFromDetailsPage!: boolean;

  editableName = false;
  editableEmail = false;
  editableAddress = false;

  editedName!: string; 
  editedEmail!: string;
  editedAddress!: string;
  imageSource: string = '/assets/images/avatar.avif';
  mediaType: 'image' | null = null;
  selectedMedia!: any;
  originalName!: string;

  apiUrl: string = environment.apiUrl;

  constructor(
    private readonly router: Router,
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
    private readonly commonService: CommonService,
    private readonly storageService: StorageService,
    private readonly navCtrl: NavController
  ) {
    const previousUrl = this.router
      .getCurrentNavigation()
      ?.previousNavigation?.finalUrl?.toString();
    this.openedFromCameraPage = previousUrl === '/camera';
    this.openedFromDetailsPage = previousUrl === '/details';
  }

  ngOnInit() {
    // this.phonenumber = this.authService.getResponseData();
    console.log(this.phonenumber);
    // this.fetchProfileData(this.phonenumber);
  }

  onKeyPress(event: any) {
    const inputChar = String.fromCharCode(event.charCode);
    const pattern = /^[A-Za-z\s]+$/;
    if (!pattern.test(inputChar)) {
      // Invalid character, prevent input
      event.preventDefault();
    }
  }
  
  fetchProfileData(userId: any) {
    this.commonService.simpleLoader('Loading...');
    if (userId !== this.phonenumber) {
      this.commonService.dismissLoader();
    }
    this.profileService.getProfileData(userId).subscribe(
      (data) => {
        this.name = data.name;
        this.email = data.email;
        this.address = data.adress;
        if (data.user_image === null) {
          this.imageSource = '/assets/images/avatar.avif';
        } else {
          this.imageSource = environment.apiUrl + data.user_image;
        }
        console.log('User Image' + this.imageSource);
        this.commonService.dismissLoader();
      },
      (error) => {
        this.commonService.dismissLoader();
        console.error('Error fetching profile data', error);
      }
    );
  }
  toggleEdit(field: string) {
    if (field === 'name') {
      this.editableName = !this.editableName;
      this.editableEmail = false;
      this.editableAddress = false;
      this.editedName = this.name;
    } else if (field === 'email') {
      this.editableEmail = !this.editableEmail;
      this.editableName = false;
      this.editableAddress = false;
      this.editedEmail = this.email;
    } else if (field === 'address') {
      this.editableAddress = !this.editableAddress;
      this.editableName = false;
      this.editableEmail = false;
      this.editedAddress = this.address;
    }
  }

  saveEdit(field: string) {
    let formData = new FormData();
    formData.append('phonenumber', this.phonenumber);
    // Append the updated field based on the 'field' parameter
    if (field === 'name') {
      this.name = this.editedName;
      this.editableName = false;
      formData.append('name', this.name);
    } else if (field === 'email') {
      this.email = this.editedEmail;
      this.editableEmail = false;
      formData.append('email', this.email);
    } else if (field === 'address') {
      this.address = this.editedAddress;
      this.editableAddress = false;
      formData.append('adress', this.address);
    }
    this.profileService.updateProfileData(formData).subscribe(
      (res) => {
        if (field === 'name') {
          this.commonService.presentToast('name has been updated', 3000);
        } else if (field === 'email') {
          this.commonService.presentToast('email has been updated', 3000);
        } else if (field === 'address') {
          this.commonService.presentToast('address has been updated', 3000);
        }
      },
      (error) => {
        this.commonService.presentToast(
          'Something went wrong! Please try again later.',
          5000
        );
      }
    );
  }

  cancelEdit(field: string) {
    if (field === 'name') {
      this.editableName = false;
    } else if (field === 'email') {
      this.editableEmail = false;
    } else if (field === 'address') {
      this.editableAddress = false;
    }
  }
  takePicture = async () => {
    try {
      const image: CameraPhoto = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        // saveToGallery: true,
      });

      if (image && image.dataUrl) {
        this.handleImageFile(image.dataUrl, `image_${Date.now()}.jpg`);
        console.log(this.imageSource);
      } else {
        console.error('Error taking picture: No image data');
        this.commonService.presentToast(
          'Error taking picture: No image data',
          3000
        );
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      this.commonService.presentToast('Error taking picture!', 3000);
    }
  };

  handleImageFile(dataUrl: string, originalName: string) {
    this.imageSource = dataUrl;
    this.mediaType = 'image';
    this.selectedMedia = dataUrl;
    this.editImage();
    this.originalName = originalName; // Store the original name of the selected image
    console.log(this.originalName);
  }

  async editImage() {
    if (!this.selectedMedia || !this.mediaType) {
      console.error('No file selected');
      this.commonService.presentToast('No file selected', 3000);
      return;
    }
    const blob = await fetch(this.selectedMedia).then((res) => res.blob());
    try {
      this.commonService.simpleLoader('Uploading...');
      let formData = new FormData();
      formData.append('phonenumber', this.phonenumber);
      formData.append('user_image', blob, this.originalName);
      this.profileService.updateProfileData(formData).subscribe((res) => {
        this.commonService.dismissLoader();
        this.commonService.presentToast(
          'Profile photo successfully uploaded',
          3000
        );
      });
    } catch (error) {
      this.commonService.dismissLoader();
      this.commonService.presentToast(
        'Something went wrong! Please try again later.',
        5000
      );
      console.error('Error uploading image:', error);
    }
  }

  logout() {
    this.storageService.clearPreference().then(() => {
      this.navCtrl.navigateRoot(['/signin']);
      this.commonService.presentToast('Logged Out Successfully ...', 3000);
    });
  }
}
