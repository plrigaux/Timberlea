import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { ChangeDir_Request, ChangeDir_Response, FileDetails, FileList_Response, FileType } from 'server/src/common/interfaces';
import { endpoints } from 'server/src/common/constants';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {



  cdPath: string = "common"
  fileName: string = ""
  remoteDirectory = ""
  remoteFiles: FileDetails[] = []

  constructor(private http: HttpClient, private router: Router) {

  }

  pwd() {
    console.log("click PWD")

    this.http.get<ChangeDir_Response>(environment.serverUrl + endpoints.FS_PWD).subscribe({
      next: (data: ChangeDir_Response) => {
        console.log(data)
        this.remoteDirectory = data.directory
        this.list()
      },
      error: error => {
        //this.errorMessage = error.message;
        console.error('There was an error!', error);
      }
    })
  }


  cd() {

    let newRemoteDirectory: ChangeDir_Request = {
      remoteDirectory: this.remoteDirectory,
      newPath: this.cdPath
    }

    console.log("path: " + newRemoteDirectory)

    this.http.put<ChangeDir_Response>(environment.serverUrl + endpoints.FS_CD, newRemoteDirectory).subscribe({
      next: (data: ChangeDir_Response) => {
        console.log(data)
        this.remoteDirectory = data.directory
        //this.remoteFiles = []
        this.list()
      },
      error: error => {
        //this.errorMessage = error.message;
        console.error(error.message, error.error, error);
      }
    });
  }

  list() {
    //const headers = new HttpHeaders().set('Content-Type', 'text/plain; charset=utf-8');
    console.log(this.router.url);
    //const options =
    //  { params: new HttpParams().set('dir', this.remoteDirectory) };

    let remoteDirectory = encodeURIComponent(this.remoteDirectory);

    this.http.get<FileList_Response>(environment.serverUrl + endpoints.FS_LIST + "/" + remoteDirectory).subscribe({
      next: (data: FileList_Response) => {
        console.log(data)
        this.remoteDirectory = data.parent

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

  displayTypeIcon(type: FileType): string {
    switch (type) {
      case FileType.Directory:
        return "folder"
    }
    return "text_snippet"
  }

  setCdPath(param: FileDetails) {
    if (param.type == FileType.Directory) {
      this.cdPath = param.name
    } else if (param.type == FileType.File) {
      this.fileName = param.name
    }
  }

  downloadFile() {

    const href = environment.serverUrl + endpoints.FS_DOWNLOAD + "/" + encodeURIComponent(this.remoteDirectory) + "/" + encodeURIComponent(this.fileName);
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', href);
    link.setAttribute('download', this.fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
}
