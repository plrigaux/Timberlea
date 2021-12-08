import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { FileDetails, FileList, FileType } from 'server/common/interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private urls = 'http://localhost:8000'

  cdPath: string = "some path"

  remotePath = ""
  remoteFiles : FileDetails[] = []

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

    let p = this.cdPath
    console.log("path: " + p)
    const headers = { 'Accept': 'text/plain' };
    this.http.put(this.urls + '/fs/cd', p, {headers, responseType: 'text'}).subscribe({
      next: data => {
        console.log(data)

      },
      error: error => {
        //this.errorMessage = error.message;
        console.error('There was an error!', error);
      }
    });

  }

  list() {
    const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    this.http.get<FileList>(this.urls + '/fs/list').subscribe({
      next: (data : FileList) => {
        console.log(data)
        this.remotePath = data.path
        this.remoteFiles = data.files
      },
      error: error => {
        //this.errorMessage = error.message;
        console.error('There was an error!', error);
      }
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

  displayType(type:FileType) : string {
    return FileType[type]
  }
}
