import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  apiUrl: string = environment.apiUrl;
  // private apiUrl = 'https://jsonplaceholder.typicode.com/users/';

  constructor(private http: HttpClient) {}

  getProfileData(userId: any): Observable<any> {
    console.log(userId);
    return this.http.get<any>(this.apiUrl + '/traffic/profile/all/' + userId);
  }

  updateProfileData(data: FormData): Observable<any> {
    console.log(data.get('name'));
    console.log(data.get('email'));
    console.log(data.get('address'));
    console.log(data.get('phonenumber'));
    console.log(data.get('user_image'));
    return this.http.post<any>(this.apiUrl + '/traffic/profile/all/', data);
  }
}
