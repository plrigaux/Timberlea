import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {


  messages = this.http.get<any[]>('http://localhost:8000/api/list')

  constructor(private http: HttpClient) {

  }
}
