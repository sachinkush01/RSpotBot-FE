import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';
import { VehicleDetailService } from 'src/app/service/vehicle-detail.service';
import * as base64js from 'base64-js';
import { CommonService } from 'src/app/service/common.service';
import { Router } from '@angular/router';
import { SettingPopoverComponent } from '../popover/setting-popover/setting-popover.component';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscriber, Subscription } from 'rxjs';
import { File } from '@awesome-cordova-plugins/file/ngx';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent  implements OnInit,OnDestroy {
  @ViewChild('mediaContainer') mediaContainer!: ElementRef;
  @ViewChild('video')video!:ElementRef<HTMLVideoElement>;

  mediaSrc: any | null = null;;
  mediaType: 'image' | 'video' | null = null;
  mediaName!: string;
  selectedMedia: string | null = null;
  recording = false;
  recordingFileNames: any = [];
  recordedData: string | undefined;
  isRecording: boolean = false;
  coordinates_x: any;
  coordinates_y: any;
  startTime = 0;
  endTime = 0;
  isPaused: boolean = false;
  boundingBoxVisible: boolean = false;
  boundingBoxStyle: { top: string; left: string } = { top: '0px', left: '0px' };
  uploadDataDestory!:Subscription;
  
  private mediaSource = new MediaSource();
  private stream: any;
  private mediaRecorder:any;
  private recordedBlobs:any;
  private sourceBuffer:any;
  private superBuffer:any;

  private initTime = 0;
  private lastTime = 0;
  enableRecord = false;  

  constructor( private popoverController:PopoverController,
               private vehicleService:VehicleDetailService,
               private readonly commonService: CommonService,
               private router:Router,
               private modalController: ModalController,
               private dialog: MatDialog,
               private cdr:ChangeDetectorRef,
               private sanitizer: DomSanitizer,
               private file :File,
               private http: HttpClient
              ) { }
  ngOnDestroy(): void {
    if (this.uploadDataDestory) {
      this.uploadDataDestory.unsubscribe();
    }
   console.log('upload ')
  }

  ngOnInit() {
    // this.mediaSource='https://i.pinimg.com/originals/2a/ad/3b/2aad3be753d916ae24a327b3be9ee5b5.jpg';
    // this.mediaType='image'
    this.mediaSrc = this.vehicleService.getMediaInfo().mediaSource;
    this.mediaType=this.vehicleService.getMediaInfo().mediaType;
    this.mediaName=this.vehicleService.getMediaInfo().fileName;
    this.selectedMedia=this.mediaSrc;
    console.log('Media Type',this,this.mediaType);
    this.copyImage(this.mediaSrc,this.mediaName);
  }
  destinationPath: string = 'file:///storage/emulated/0/Android/data/com.video.rspotbot/files/socialsharing-downloads/';

  async downloadAndCopyImage(imagePath: string): Promise<void> {
    const timestamp = new Date().getTime(); // Generate a unique timestamp
    const imageName = `image_${timestamp}.jpg`;

    try {
        const downloadedImagePath = await this.downloadImage(imagePath, imageName);
        this.copyImage(downloadedImagePath, imageName);
    } catch (error) {
        console.error("Error downloading and copying image:", error);
    }
}
async downloadImage(imagePath: string, imageName: string): Promise<string> {
  const fileURL = `${this.destinationPath}${imageName}`;

  try {
      const blob = await this.http.get(imagePath, { responseType: 'blob' }).toPromise();
      const buffer = await this.blobToBuffer(blob);

      // Write the buffer to a file
      await this.file.writeFile(this.destinationPath, imageName, buffer, { replace: true });

      console.log("Image downloaded and saved:", fileURL);
      return fileURL;
  } catch (error) {
      console.error("Error downloading image:", error);
      throw error;
  }
}

blobToBuffer(blob: any): Promise<ArrayBuffer> {
  return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
          resolve(reader.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(blob);
  });
}

async copyImage(imagePath: string, imageName: string) {
  try {
    const fileName = `copied_image-${Date.now()}.jpg`;
    // const fileName = `copied_${(imageName || '').replace(/\s/g, "_")}.jpg`; 
    // console.log("file name", fileName);
    //   console.log("Before destination", this.destinationPath);

    //   // Remove 'file://' from imagePath
    //   const cleanedImagePath = imagePath.replace('file://', '');
      console.log("cleaned image path",imagePath)
      await this.file.copyFile(imagePath, imageName, this.destinationPath, fileName).then(_=>
        console.log("'Directory exists'")
      ).catch(err =>
        console.log('Directory doesnt exist'));
      console.log("After destination", this.destinationPath);
  } catch (error) {
      console.error("Error copying file:", error);
  }
}

  async openSettings(ev: any) {
    const dialogRef = this.dialog.open(SettingPopoverComponent, {
      width: '200px', 
      height:'100px',
      panelClass: 'mat-dialog'
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
  
  getCoordinates(event: TouchEvent) {
    console.log("sachin")
    const mediaContainer = this.mediaContainer.nativeElement;
    const media = event.target as HTMLMediaElement;

    const isImage = media instanceof HTMLImageElement;
    const isVideo = media instanceof HTMLVideoElement;
    if (!media || !media.duration) {
      return;
    }

    if (isImage || isVideo) {
      const rect = mediaContainer.getBoundingClientRect();
      const touch = event.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      this.coordinates_x = x;
      this.coordinates_y = y;

      console.log('Coordinates relative to media:', { x, y });

      if (media.paused) {
        this.startTime = media.currentTime;
        console.log('Start Time (paused):', this.startTime);
        this.isPaused = true;
      } else {
        this.startTime = (x / rect.width) * media.duration;
        console.log('Start Time (playing):', this.startTime);
        this.isPaused = false;
      }

      this.endTime = media.duration;
      console.log('End Time:', this.endTime);

      const boundingBoxWidth = 100;
      const boundingBoxHeight = 100;
      const boundingBoxX = x - boundingBoxWidth / 2;
      const boundingBoxY = y - boundingBoxHeight / 2;

      // console.log('Coordinates relative to bounding box:', { boundingBoxX, boundingBoxY });

      this.boundingBoxStyle = {
        top: `${boundingBoxY}px`,
        left: `${boundingBoxX}px`,
      };
      this.boundingBoxVisible = true;
    }
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
        formData.append('upload_image', blob, this.mediaName);

        // formData.append('coordinates_x', this.coordinates_x);
        // formData.append('coordinates_y', this.coordinates_y);

      } else if (this.mediaType === 'video') {
        const blob = await fetch(this.selectedMedia).then((res) => res.blob());
        formData.append('upload_video', blob, this.mediaName);

        // formData.append('coordinates_x', this.coordinates_x);
        // formData.append('coordinates_y', this.coordinates_y);
      }
      this.uploadDataDestory= this.vehicleService.uploadImage(formData).subscribe(
        (response: any) => {
          console.log('Upload successful', response);
          this.vehicleService.setUploadData(response);
          this.router.navigate(['/offence']);
          this.commonService.dismissLoader();
        },
        (error) => {
          this.commonService.dismissLoader();
          console.error('Upload error', error);
          console.log('Detailed error:', JSON.stringify(error));
          this.router.navigate(['/offence']);
        }
      );
    } catch (error) {
      console.error('Upload error', error);
      console.log('Detailed error:', JSON.stringify(error));
      this.commonService.dismissLoader();
    }
    // this.router.navigate(['/offence']);
}

  async cancel() {
    await this.modalController.dismiss(); 
  }

  play(){
    this.video.nativeElement.currentTime = this.startTime;
    this.video.nativeElement.play();
    if(this.enableRecord){
      this.startTrimming();
    }
  }

  trimVideo(){
    this.lastTime =this.video.nativeElement.duration
    this.enableRecord = true;
    this.play();
    setTimeout(() => {
      this.stopRecording();
    }, (this.lastTime - this.startTime) * 1000);
  }
  
  startTrimming() {
    let options = {mimeType: 'video/webm'};
    this.recordedBlobs = [];
    if((<any>this.video.nativeElement).captureStream) {
      this.stream = (<any>this.video.nativeElement).captureStream();
    }else if((<any>this.video.nativeElement).mozCaptureStream) {
      this.stream = (<any>this.video.nativeElement).mozCaptureStream();      
    }
    try {
        this.mediaRecorder = new MediaRecorder(this.stream, options);
    } catch (e0) {
        console.log('Unable to create MediaRecorder with options Object: ', e0);
        try {
        options = {mimeType: 'video/webm,codecs=vp9'};
        this.mediaRecorder = new MediaRecorder(this.stream, options);
        } catch (e1) {
        console.log('Unable to create MediaRecorder with options Object: ', e1);
        try {
            options = <any>'video/vp8'; // Chrome 47
            this.mediaRecorder = new MediaRecorder(this.stream, options);
        } catch (e2) {
            alert('MediaRecorder is not supported by this browser.\n\n' +
            'Try Firefox 29 or later, or Chrome 47 or later, ' +
            'with Enable experimental Web Platform features enabled from chrome://flags.');
            console.error('Exception while creating MediaRecorder:', e2);
            return;
        }
      }
    }
    console.log('Created MediaRecorder', this.mediaRecorder, 'with options', options);
    this.mediaRecorder.onstop = (event:any)=>{
      this.handleStop(event);
    };
    this.mediaRecorder.ondataavailable = (event:any)=>{
      this.handleDataAvailable(event);
    };
    this.mediaRecorder.start(100); // collect 100ms of data
    console.log('MediaRecorder started', this.mediaRecorder);
  }

  stopTrimming() {
    this.mediaRecorder.stop();
    console.log('Recorded Blobs: ', this.recordedBlobs);
    //this.video2.nativeElement.controls = true;
  }
  handleSourceOpen(){
    this.sourceBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  }

  handleDataAvailable(event:any){
    if (event.data && event.data.size > 0) {
        this.recordedBlobs.push(event.data);
    }
  }

  handleStop(event:any) {
      console.log('Recorder stopped: ', event);
      this.superBuffer = new Blob(this.recordedBlobs, {type: 'video/webm'});
      this.video.nativeElement.src = window.URL.createObjectURL(this.superBuffer);
      var reader = new FileReader();
      reader.readAsDataURL(this.superBuffer); 
      reader.onloadend = () => {
        let base64data = reader.result;                
        console.log(base64data);
        // this.base64.emit(base64data);
    }
      
  }

 
 
 downloadTrimmedVideo() {
      if (this.superBuffer) {
        const blobUrl = URL.createObjectURL(this.superBuffer);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'trimmed_video.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }
}

