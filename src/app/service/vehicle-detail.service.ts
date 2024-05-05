import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DitectionResponse } from '../screens/detectionResponse ';
import { Offenses } from '../class/offences.model';

@Injectable({
  providedIn: 'root',
})
export class VehicleDetailService {
  apiUrl: string = environment.apiUrl;
  // private apiUrl = 'http://13.49.207.165:8000/traffic/api/upload/';
  private mediaSource: any | null = null;
  private mediaType: 'image' | 'video' | null = null;
  private fileName:any;

  private responseDataSubject: BehaviorSubject<any> = new BehaviorSubject<any>(
    null
  );
  responseData$ = this.responseDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  uploadImage(formData: FormData): Observable<any> {
    console.log(formData.get('upload_image'));
    console.log('test');
    return this.http.post(this.apiUrl + '/traffic/api/upload/', formData);
  }

  setUploadData(responseData: any) {
    this.responseDataSubject.next(responseData);
    console.log(responseData);
  }

  setmediaSource(source: any,mediaType:'image'|'video',fileName:any) {
    this.mediaSource = source;
    this.mediaType=mediaType;
    console.log('Sahreee:::', this.mediaSource);
    console.log("mediaaaaaaaaaaaa",this.mediaType)
  }

  getMediaInfo(): { mediaSource: any; mediaType: 'image' | 'video' | null; fileName:any } {
    return { mediaSource: this.mediaSource, mediaType: this.mediaType ,fileName:this.fileName};
  }

  fetchData(): Observable<Offenses> {
    return this.http.get<Offenses>(this.apiUrl);
  }
}
