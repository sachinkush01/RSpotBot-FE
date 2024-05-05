import { Component, OnInit, ViewChild, ElementRef, Input, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

declare var MediaRecorder: any;

@Component({
  selector: 'video-trimmer',
  templateUrl: './video-trimmer.component.html',
  styleUrls: ['./video-trimmer.component.scss']
})
export class VideoTrimmerComponent implements OnInit {

  private mediaSource = new MediaSource();
  private stream: any;
  private mediaRecorder:any;
  private recordedBlobs:any;
  private sourceBuffer:any;
  private superBuffer:any;

  private initTime = 0;
  private lastTime = 0;

  enableRecord = false;  

  @ViewChild('video') video!:ElementRef<HTMLVideoElement>;
  //@ViewChild('video2') video2:ElementRef<HTMLVideoElement>;
  @ViewChild('mediaContainer') mediaContainer!: ElementRef;


  // @Input('source') source!:string;

  // @Output('base64') base64:EventEmitter<any> = new EventEmitter();

  duration = 0;
  // @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  boundingBoxVisible: boolean = false;
  fileError!: boolean;
  startTime = 0;
  endTime = 0;
  public videoSrc: any | null = null;
  isDrawingSquare = false;
  mediaType: 'video' | null = null;
  coordinates_x: any;
  coordinates_y: any;
  isPaused: boolean = false;
  boundingBoxStyle: { top: string; left: string } = { top: '0px', left: '0px' };

  constructor(
    private cdr:ChangeDetectorRef,
    private sanitizer: DomSanitizer
  ) { }
  public browseFile(files: FileList | null) {
    this.boundingBoxVisible = false;
    if (!files || files.length === 0) {
      return;
    }

    if (files.length) {
      const selectedFile = files[0];
      const mimeType = selectedFile.type;
     if (mimeType.startsWith('video/')) {
        this.handleVideoFile(selectedFile);
      } else {
        this.fileError = true;
      }
    }
  }
     
    handleVideoFile(file: File) {
      const url = URL.createObjectURL(file);
      this.videoSrc = this.sanitizer.bypassSecurityTrustUrl(url);

      // this.videoSrc = url;
      this.startTime = 0;
      this.endTime = 0;
      console.log('Video URL:', url);
      this.mediaType='video'
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
  
        this.lastTime = media.duration;
        console.log('End Time:', this.lastTime);
  
        const boundingBoxWidth = 100;
        const boundingBoxHeight = 100;
        const boundingBoxX = x - boundingBoxWidth / 2;
        const boundingBoxY = y - boundingBoxHeight / 2;
  
  
        this.boundingBoxStyle = {
          top: `${boundingBoxY}px`,
          left: `${boundingBoxX}px`,
        };
        this.boundingBoxVisible = true;
      }
    }
  ngOnInit() {
    this.mediaSource.addEventListener('sourceopen', this.handleSourceOpen, false);
    // this.video.nativeElement.ontimeupdate = ()=>{
    //   console.log("current",this.video.nativeElement.currentTime,this.lastTime);
    //   if(this.lastTime && this.video.nativeElement.currentTime >= this.lastTime){
    //     this.video.nativeElement.pause();
    //     if(this.enableRecord){
    //       this.stopRecording();
    //       this.enableRecord = false;
    //       this.cdr.detectChanges();
    //     }
    //   }
    // }
    // // window['video'] = this.video;
    // this.video.nativeElement.onloadeddata = ()=>{
    //   console.log("dectectChanges",this.video.nativeElement.duration);
    //   this.duration = this.video.nativeElement.duration;
    //   this.cdr.detectChanges();
    // }
  }

  play(){
    this.video.nativeElement.currentTime = this.startTime;
    this.video.nativeElement.play();
    if(this.enableRecord){
      this.startRecording();
    }
  }

  trimVideo(){
    this.lastTime =this.video.nativeElement.duration
    this.enableRecord = true;
    this.play();
  }

  // setTimeInit(value){
  //   if(this.video && this.video.nativeElement.duration){
  //     this.initTime = value;
  //     console.log("value",this.initTime);
  //     this.video.nativeElement.currentTime = this.initTime;
  //   }
  // }

  // setTimeLast(value){
  //   let timeFinish = value;
  //   this.lastTime = timeFinish;
  // }

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
      //this.video2.nativeElement.src = window.URL.createObjectURL(this.superBuffer);
      var reader = new FileReader();
      reader.readAsDataURL(this.superBuffer); 
      reader.onloadend = () => {
        let base64data = reader.result;                
        console.log(base64data);
        // this.base64.emit(base64data);
    }
      
  }

  startRecording() {
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

  stopRecording() {
    this.mediaRecorder.stop();
    console.log('Recorded Blobs: ', this.recordedBlobs);
    //this.video2.nativeElement.controls = true;
  }
  
}
