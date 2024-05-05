import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
// import * as p5 from 'p5';

@Component({
  selector: 'app-media',
  templateUrl: './media.component.html',
  styleUrls: ['./media.component.scss'],
})
export class MediaComponent {

    private mediaSource = new MediaSource();
    private stream:any;
    private mediaRecorder:any;
    private recordedBlobs:any;
    private sourceBuffer:any;
    private superBuffer:any;
  
    private initTime = 0;
    private lastTime = 4;
  
    @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  
    duration = 0;
  
    constructor(private cdr: ChangeDetectorRef) { }
  
    ngOnInit() {
      this.mediaSource.addEventListener('sourceopen', this.handleSourceOpen.bind(this), false);
    
      if (this.video && this.video.nativeElement) {
        this.video.nativeElement.ontimeupdate = () => {
          console.log("current", this.video.nativeElement.currentTime, this.lastTime);
          if (this.lastTime && this.video.nativeElement.currentTime >= this.lastTime) {
            this.video.nativeElement.pause();
            this.stopRecording();
          }
        };
    
        this.video.nativeElement.onloadeddata = () => {
          console.log("detectChanges", this.video.nativeElement.duration);
          this.duration = this.video.nativeElement.duration;
          this.cdr.detectChanges();
        };
      }
    }
    
  
    play() {
      this.video.nativeElement.currentTime = this.initTime;
      this.video.nativeElement.play();
      this.startRecording();
    }
  
    trimVideo() {
      this.play();
    }
  
    setTimeInit(value:any) {
      if (this.video && this.video.nativeElement.duration) {
        this.initTime = value;
        console.log("value", this.initTime);
        this.video.nativeElement.currentTime = this.initTime;
      }
    }
  
    setTimeLast(value:any) {
      this.lastTime = value;
    }
  
    handleSourceOpen() {
      this.sourceBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
    }
  
    handleDataAvailable(event:any) {
      if (event.data && event.data.size > 0) {
        this.recordedBlobs.push(event.data);
      }
    }
  
    handleStop() {
      console.log('Recorder stopped');
      this.superBuffer = new Blob(this.recordedBlobs, { type: 'video/webm' });
  
      // Trigger download
      const downloadLink = document.createElement('a');
      downloadLink.href = window.URL.createObjectURL(this.superBuffer);
      downloadLink.download = 'trimmed_video.webm';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  
    startRecording() {
      let options = { mimeType: 'video/webm' };
      this.recordedBlobs = [];
      if ((<any>this.video.nativeElement).captureStream) {
        this.stream = (<any>this.video.nativeElement).captureStream();
      } else if ((<any>this.video.nativeElement).mozCaptureStream) {
        this.stream = (<any>this.video.nativeElement).mozCaptureStream();
      }
      try {
        this.mediaRecorder = new MediaRecorder(this.stream, options);
      } catch (e) {
        console.error('Exception while creating MediaRecorder:', e);
        return;
      }
      console.log('Created MediaRecorder', this.mediaRecorder, 'with options', options);
  
      this.mediaRecorder.onstop = this.handleStop.bind(this);
      this.mediaRecorder.ondataavailable = this.handleDataAvailable.bind(this);
      this.mediaRecorder.start(100); // collect 100ms of data
      console.log('MediaRecorder started', this.mediaRecorder);
    }
  
    stopRecording() {
      this.mediaRecorder.stop();
      console.log('Recorded Blobs: ', this.recordedBlobs);
    }
  
    onFileSelected(event: Event) {
      const inputElement = event.target as HTMLInputElement;
      if (inputElement.files && inputElement.files.length > 0) {
        const file = inputElement.files[0];
        const objectURL = URL.createObjectURL(file);
        this.video.nativeElement.src = objectURL;
        this.duration = this.video.nativeElement.duration;
        this.cdr.detectChanges();
      }
    }
  }
  