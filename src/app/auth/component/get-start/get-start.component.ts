import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-get-start',
  templateUrl: './get-start.component.html',
  styleUrls: ['./get-start.component.scss'],
})
export class GetStartComponent  implements OnInit {

  imagePath: string = 'assets/images/GetStart.png';
  constructor(private router:Router) { }

  ngOnInit() {}
  getStart(){
    this.router.navigate(['/signin']);
  }

}
