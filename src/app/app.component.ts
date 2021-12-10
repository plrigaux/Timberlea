import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { FileDetails, FileList, FileType, RemoteDirectory } from 'server/common/interfaces';
import { endpoints } from 'server/common/constants';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  private urls = 'http://localhost:8000'

  cdPath: string = "common"

  remoteDirectory = ""
  remoteFiles: FileDetails[] = []

  constructor(private http: HttpClient) {

  }

  pwd() {
    console.log("click PWD")

    this.http.get<RemoteDirectory>(this.urls + endpoints.FS_PWD).subscribe({
      next: (data: RemoteDirectory) => {
        console.log(data)
        this.remoteDirectory = data.remoteDirectory
      },
      error: error => {
        //this.errorMessage = error.message;
        console.error('There was an error!', error);
      }
    })
  }


  cd() {

    let newRemoteDirectory: RemoteDirectory = {
      remoteDirectory: this.remoteDirectory,
      newPath: this.cdPath
    }

    console.log("path: " + newRemoteDirectory)

    this.http.put<RemoteDirectory>(this.urls + endpoints.FS_CD, newRemoteDirectory).subscribe({
      next: (data: RemoteDirectory) => {
        console.log(data)
        this.remoteDirectory = data.remoteDirectory
        this.remoteFiles = []
      },
      error: error => {
        //this.errorMessage = error.message;
        console.error(error.message, error.error, error);
      }
    });
  }

  list() {
    //const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');

    const options =
      { params: new HttpParams().set('dir', this.remoteDirectory) };



    this.http.get<FileList>(this.urls + endpoints.FS_LIST, options).subscribe({
      next: (data: FileList) => {
        console.log(data)
        this.remoteDirectory = data.path

        this.remoteFiles = [{ name: '..', type: FileType.Directory }, ...data.files]
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
    return new Error(
      'Something bad happened; please try again later.');
  }

  displayType(type: FileType): string {
    return FileType[type]
  }

  setCdPath(param: FileDetails) {
    if (param.type == FileType.Directory) {
      this.cdPath = param.name
    }
  }
}
