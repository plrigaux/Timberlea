import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private urls = 'http://localhost:8000'

  constructor(private http: HttpClient) {

  }

  pwd() {
    console.log("click PWD")
    const options = {
      responseType: 'text' as const,
    };
    this.http.get(this.urls + '/fs/pwd', options).pipe(
      catchError(this.handleError)
    ).subscribe((data: any) => {
      console.log(data)
    })
  }


  cd() {
    let msg = this.http.get<any[]>(this.urls + '/fs/cd')
    console.log(msg)
  }
  list() {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    this.http.get<any[]>(this.urls + '/fs/list').subscribe((data: any) => {
      console.log(data)
    })
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.');
  }
}
