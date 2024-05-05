import {
  Component,
  ElementRef,
  HostListener,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { MediaCapture } from '@awesome-cordova-plugins/media-capture/ngx';
import {
  Camera,
  CameraPhoto,
  CameraResultType,
  CameraSource,
} from '@capacitor/camera';
// import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { ModalController, Platform, PopoverController } from '@ionic/angular';
import { CommonService } from 'src/app/service/common.service';
import { VehicleDetailService } from 'src/app/service/vehicle-detail.service';
import { VideoTrimService } from 'src/app/service/video-trim.service';
import{Filesystem,Directory} from '@capacitor/filesystem';
import { VoiceRecorder, RecordingData } from 'capacitor-voice-recorder';
import * as base64js from 'base64-js';
import { SettingPopoverComponent } from '../popover/setting-popover/setting-popover.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent implements OnInit {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  @ViewChild('mediaContainer') mediaContainer!: ElementRef;

  isRecording: boolean = false;
  mediaType: 'image' | 'video' | null = null;
  selectedMedia: string | null = null;
  originalName!: string;
  public imageSrc: any | null = null;
  public videoSrc: any | null = null;
  isDrawingSquare = false;
  startX!: number;
  startY!: number;
  fileError!: boolean;
  boundingBoxVisible: boolean = false;
  boundingBoxStyle: { top: string; left: string } = { top: '0px', left: '0px' };
  startTime = 0;
  endTime = 0;
  isPaused: boolean = false;
  trimmedVideoBlob: Blob | null = null;
  trimmedVideoPath: string | null = null;
  coordinates_x: any;
  coordinates_y: any;
  recording = false;
  recordingFileNames: any = [];
  recordedData: string | undefined;
  @ViewChild('popover')popover:any;

  isOpen = false;
  constructor(
    private readonly popoverController: PopoverController,
    private modalController: ModalController,
    private readonly vehicleService: VehicleDetailService,
    private readonly router: Router,
    @Inject(MediaCapture)
    private readonly mediaCapture: MediaCapture,
    private readonly platform: Platform,
    // private readonly androidPermissions: AndroidPermissions,
    private readonly commonService: CommonService,
    private videoTrimService: VideoTrimService,
    private dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    // await this.androidPermissionCheck();
    VoiceRecorder.requestAudioRecordingPermission();
  }

  // async androidPermissionCheck() {
  //   if (await this.platform.ready()) {
  //     if (this.platform.is('android')) {
  //       const hasCameraPermission = this.androidPermissions.checkPermission(
  //         this.androidPermissions.PERMISSION.CAMERA
  //       );

  //       const hasRecordAudioPermission =
  //         this.androidPermissions.checkPermission(
  //           this.androidPermissions.PERMISSION.RECORD_AUDIO
  //         );

  //       if (
  //         (await hasCameraPermission).hasPermission &&
  //         (await hasRecordAudioPermission).hasPermission
  //       ) {
  //         console.log('has all permissions');
  //       } else {
  //         const permissions = [
  //           this.androidPermissions.PERMISSION.CAMERA,
  //           this.androidPermissions.PERMISSION.RECORD_AUDIO,
  //         ];

  //         this.androidPermissions
  //           .requestPermissions(permissions)
  //           .then((res) => {
  //             console.log('res:', res);

  //             if (res.hasPermission) {
  //               console.log('has granted permission');
  //             }
  //           });
  //       }
  //     }
  //   }
  // }

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
  @HostListener('document:keydown.space', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.isRecording) {
      this.startRecording();
    }
  }

  @HostListener('document:keyup.space', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (this.isRecording) {
      this.stopRecording();
    }
  }
  
  async startRecording() {
    if (this.isRecording) {
      return;
    }

    this.isRecording = true;
    this.recordedData = undefined;

    await VoiceRecorder.startRecording();
  }

  async stopRecording() {
    if (!this.isRecording) {
      return;
    }

    this.isRecording = false;
    this.recording = true;

    await VoiceRecorder.stopRecording().then(async (result: RecordingData) => {
      if (result.value && result.value.recordDataBase64) {
        this.recordedData = result.value.recordDataBase64;
        console.log('Recording', this.recordedData);
        const fileName = new Date().getTime() + '.wav';
        console.log('Recording NAME', fileName);
      }
    });
  }

  playRecording() {
    if (this.recordedData) {
      const byteArray = base64js.toByteArray(this.recordedData);
      const blob = new Blob([new Uint8Array(byteArray)], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);

      const audio = new Audio();
      audio.src = audioUrl;
      audio.play();
    }
  }
  takePicture = async () => {
    try {
      const image: CameraPhoto = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        saveToGallery: true,
      });

      const imageUrl = image.webPath;

      // imageElement.src = imageUrl;
      if (image && imageUrl) {
        const fileName = `image-${Date.now()}.jpg`;
        this.handleCapturedFile(imageUrl, fileName, 'image');
        // this.imageSrc = imageType;
        console.log('Image', imageUrl);
        // this.mediaType = 'image';
      } else {
        console.error('Error taking picture: No image data');
      }
    } catch (error) {
      console.error('Error taking picture:', error);
    }
  };

  public browseFile(files: FileList | null) {
    this.boundingBoxVisible = false;
    if (!files || files?.length === 0) {
      return;
    }

    if (files.length) {
      const selectedFile = files[0];
      const mimeType = selectedFile.type;

      if (mimeType.startsWith('image/')) {
        this.handleImageFile(selectedFile);
      } else if (mimeType.startsWith('video/')) {
        this.handleVideoFile(selectedFile);
      } else {
        this.fileError = true;
      }
    }
  }
  trimVideo() {
    if (this.startTime >= 0 && this.endTime > this.startTime) {
      this.videoTrimService.trimVideo(
        this.video.nativeElement,
        this.startTime,
        this.endTime
      );
    }
  }

  private downloadTrimmedVideo(blob: Blob, originalName: string) {
    const downloadLink = document.createElement('a');
    const url = URL.createObjectURL(blob);
    console.log(url);
    downloadLink.href = url;
    downloadLink.download = originalName.replace(/\.[^/.]+$/, '_trimmed.$&');
    document.body.appendChild(downloadLink);
    console.log('Blob size:', blob.size);
    console.log('Blob type:', blob.type);
    // Check if the browser supports the 'download' attribute
    if ('download' in downloadLink) {
      downloadLink.click();
    } else {
      // For browsers that don't support the 'download' attribute
      const popup = window.open(url, '_blank');
      if (!popup) {
        console.error('Failed to open a new window for the video.');
      }
    }

    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  }

  private handleImageFile(file: File) {
    const fileType = file.type;
    if (fileType.startsWith('image')) {
      const url = URL.createObjectURL(file);
      this.mediaType = 'image';
      this.selectedMedia = url;
      this.originalName = file.name;
      this.imageSrc = url;

      console.log('Image URL:', url);
      console.log('Media Type:', this.mediaType);
      console.log('Original Name:', this.originalName);
      this.vehicleService.setmediaSource(this.imageSrc,this.mediaType,this.originalName);
      this.router.navigate(['/upload']);
    }
  }

  handleVideoFile(file: File) {
    const url = URL.createObjectURL(file);
    this.mediaType = 'video';
    this.selectedMedia = url;
    this.originalName = file.name;
    this.videoSrc = url;
    this.startTime = 0;
    this.endTime = 0;
    console.log('Video URL:', url);
    console.log('Media Type:', this.mediaType);
    console.log('Original Name:', this.originalName);
    this.vehicleService.setmediaSource(this.videoSrc,this.mediaType,this.originalName);
    this.router.navigate(['/upload']);
  }

  // getCoordinates(event: TouchEvent) {
  //   const mediaContainer = this.mediaContainer.nativeElement;
  //   const media = event.target as HTMLMediaElement;

  //   const isImage = media instanceof HTMLImageElement;
  //   const isVideo = media instanceof HTMLVideoElement;
  //   if (!media || !media.duration) {
  //     return;
  //   }

  //   if (isImage || isVideo) {
  //     const rect = mediaContainer.getBoundingClientRect();
  //     const touch = event.touches[0];
  //     const x = touch.clientX - rect.left;
  //     const y = touch.clientY - rect.top;
  //     this.coordinates_x = x;
  //     this.coordinates_y = y;

  //     console.log('Coordinates relative to media:', { x, y });

  //     if (media.paused) {
  //       this.startTime = media.currentTime;
  //       console.log('Start Time (paused):', this.startTime);
  //       this.isPaused = true;
  //     } else {
  //       this.startTime = (x / rect.width) * media.duration;
  //       console.log('Start Time (playing):', this.startTime);
  //       this.isPaused = false;
  //     }

  //     this.endTime = media.duration;
  //     console.log('End Time:', this.endTime);

  //     const boundingBoxWidth = 100;
  //     const boundingBoxHeight = 100;
  //     const boundingBoxX = x - boundingBoxWidth / 2;
  //     const boundingBoxY = y - boundingBoxHeight / 2;

  //     // console.log('Coordinates relative to bounding box:', { boundingBoxX, boundingBoxY });

  //     this.boundingBoxStyle = {
  //       top: `${boundingBoxY}px`,
  //       left: `${boundingBoxX}px`,
  //     };
  //     this.boundingBoxVisible = true;
  //   }
  // }
 

  async handleCapturedFile(
    filePath: string,
    originalName: string,
    mediaType: 'image' | 'video'
  ) {
    if ((mediaType ==='image')) {
      console.log(originalName);
      this.selectedMedia = filePath;
      this.imageSrc = filePath;
      this.originalName = originalName;
      this.mediaType = 'image';
      console.log('Media Type:', this.mediaType);
      console.log('Original Name:', this.originalName);
      console.log('Image URL:', filePath);
      // await this.copyFile(filePath, originalName);
      this.vehicleService.setmediaSource(this.imageSrc,this.mediaType,this.originalName);
    } else if(mediaType==='video') {
      console.log(originalName);
      this.selectedMedia = filePath;
      this.videoSrc = filePath;
      this.originalName = originalName;
      this.mediaType = 'video';
      console.log('Media Type:', this.mediaType);
      console.log('Original Name:', this.originalName);
      console.log('Image URL:', filePath);
      // await this.copyFile(filePath, originalName);
      this.vehicleService.setmediaSource(this.videoSrc,this.mediaType,this.originalName);
    }
    this.router.navigate(['/upload']);
  }

  async copyFile(filePath: string, originalName: string) {
    try {
      debugger
      const fileName = `copied_${originalName}`;
      const temporaryDirectory = Directory.Cache;
  
      const result = await Filesystem.copy({
        from: filePath,
        to: `${temporaryDirectory}/${fileName}`,
      });
  
      if (result.uri) {
        const copiedFilePath = `${temporaryDirectory}/${fileName}`;
        console.log(`File copied successfully: ${copiedFilePath}`);
        return copiedFilePath;
      } else {
        console.error('Error copying file:', result.uri);
        throw new Error('Error copying file');
      }
    } catch (error) {
      console.error('Error copying file:', error);
      throw error;
    }
  }

  async captureVideo() {
    console.log('start recording');

    // const cameraPermission = await this.androidPermissions.hasPermission(
    //   this.androidPermissions.PERMISSION.CAMERA
    // );
    // const audioPermission = await this.androidPermissions.hasPermission(
    //   this.androidPermissions.PERMISSION.CAMERA
    // );

    // if (cameraPermission.hasPermission && audioPermission.hasPermission) {
      console.log('Camera and microphone permissions are granted.');

      const options = {
        limit: 1,
        duration: 30,
      };

      this.mediaCapture.captureVideo(options).then((res: any) => {
        console.log(res);
        if (res) {
          let win: any = window;
          var video = win.Ionic.WebView.convertFileSrc(res[0].fullPath);
          this.handleCapturedFile(video, `video_${Date.now()}.mp4`, 'video');
          console.log('url ', video);
        }
      });
    // } else {
    //   alert('Camera and microphone permissions are not granted.');
    // }
  }

  async uploadData() {
    console.log('Selected Media' + this.selectedMedia);
    this.commonService.simpleLoader('Uploading...');
    if (!this.selectedMedia || !this.mediaType) {
      console.error('No file selected');
      return;
    }

    try {
      const formData = new FormData();

      if (this.mediaType === 'image') {
        console.log('Selected Media' + this.selectedMedia);
        const blob = await fetch(this.selectedMedia).then((res) => res.blob());
        formData.append('upload_image', blob, this.originalName);

        formData.append('coordinates_x', this.coordinates_x);
        formData.append('coordinates_y', this.coordinates_y);

        // this.prediction.forEach((prediction: any) => {
        //   if (this.isVehicle(prediction.class)) {
        //     formData.append('vehicle', prediction.class);
        //     formData.append('coordinates[]', prediction.bbox[0]);
        //     formData.append('coordinates[]', prediction.bbox[1]);
        //     formData.append('coordinates[]', prediction.bbox[2]);
        //     formData.append('coordinates[]', prediction.bbox[3]);
        //   }
        // });
      } else if (this.mediaType === 'video') {
        const blob = await fetch(this.selectedMedia).then((res) => res.blob());
        formData.append('upload_video', blob, this.originalName);

        formData.append('coordinates_x', this.coordinates_x);
        formData.append('coordinates_y', this.coordinates_y);
      }
      this.vehicleService.uploadImage(formData).subscribe(
        (response: any) => {
          console.log('Upload successful', response);
          this.vehicleService.setUploadData(response);
          this.router.navigate(['/offence']);
          this.commonService.dismissLoader();
        },
        (error) => {
          this.router.navigate(['/offence']);
          this.commonService.dismissLoader();
          console.error('Upload error', error);
          console.log('Detailed error:', JSON.stringify(error));
          
        }
      );
    } catch (error) {
      console.error('Upload error', error);
      console.log('Detailed error:', JSON.stringify(error));
      this.commonService.dismissLoader();
    }
    // this.router.navigate(['/details']);
  }
  detail() {
    this.router.navigate(['/offence']);
  }
}
