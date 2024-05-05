import { Injectable, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class VideoTrimService {
  public base64Data: EventEmitter<string> = new EventEmitter<string>();

  trimVideo(videoElement: HTMLVideoElement, startTime: number, endTime: number): void {
    const trimDuration = endTime - startTime;

    // Create a canvas to draw the trimmed portion of the video
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Unable to get 2D context for canvas');
      return;
    }

    // Set canvas dimensions to match the trimmed duration
    canvas.width = trimDuration * videoElement.videoWidth / videoElement.duration;
    canvas.height = videoElement.videoHeight;

    // Draw the trimmed portion of the video onto the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(
      videoElement,
      startTime * videoElement.videoWidth / videoElement.duration,
      0,
      trimDuration * videoElement.videoWidth / videoElement.duration,
      videoElement.videoHeight,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Convert the canvas content to a Blob with the correct MIME type
    canvas.toBlob((blob) => {
      if (blob) {
        // Create a download link and trigger the download
        const downloadLink = document.createElement('a');
        const url = URL.createObjectURL(blob);
       
        // Set the correct MIME type based on your video format (e.g., 'video/mp4')
        // const mimeType = 'video/mp4';

        downloadLink.href = url;
        downloadLink.download = 'trimmed-video.mp4';
        document.body.appendChild(downloadLink);

        if ('download' in downloadLink) {
          downloadLink.click();
        } else {
          const popup = window.open(url, '_blank');
          if (!popup) {
            console.error('Failed to open a new window for the video.');
          }
        }

        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);

        // Emit base64 data if needed
        this.convertBlobToBase64(blob);
      }
    }, 'video/mp4');
  }

  private convertBlobToBase64(blob: Blob): void {
    const reader = new FileReader();
    reader.readAsDataURL(blob);

    reader.onloadend = () => {
      const base64data = reader.result as string;
      this.base64Data.emit(base64data);
    };
  }
}
