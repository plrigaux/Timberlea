import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChangeDir_Request, ChangeDir_Response, FileList_Response } from '../../../server/src/common/interfaces';
import { environment } from '../../../client/src/environments/environment';
import { endpoints } from '../../../server/src/common/constants';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileServerService {

  serverUrl: string
  remoteDirectory = ""

  constructor(private http: HttpClient) {
    this.serverUrl = environment.serverUrl
  }

  pwd(): Promise<ChangeDir_Response> {
    console.log("click PWD")

    return lastValueFrom(this.http.get<ChangeDir_Response>(this.serverUrl + endpoints.FS_PWD))
    .catch(err => {
      this.handleError(err)
      return err
    })
    .then((data: ChangeDir_Response) => {
      console.log(data)
      this.remoteDirectory = data.parent
      return data
    })
  }

  cdRelPath(relPath: string, returnList = true): Promise<ChangeDir_Response> {

    let newRemoteDirectory: ChangeDir_Request = {
      remoteDirectory: this.remoteDirectory,
      newPath: relPath,
      returnList: returnList
    }

    console.log("path: " + newRemoteDirectory)

    return lastValueFrom(this.http.put<ChangeDir_Response>(this.serverUrl + endpoints.FS_CD, newRemoteDirectory))
    .catch(err => {
      this.handleError(err)
      return err
    })
      .then((data: ChangeDir_Response) => {
        console.log(data)
        this.remoteDirectory = data.parent
        return data
      })
  }

  list(): Promise<FileList_Response> {

    let remoteDirectory = encodeURIComponent(this.remoteDirectory);

    return lastValueFrom(this.http.get<FileList_Response>(this.serverUrl + endpoints.FS_LIST + "/" + remoteDirectory))
      .catch(err => {
        this.handleError(err)
        return err
      })
      .then(
        (data: FileList_Response) => {
          console.log(data)
          this.remoteDirectory = data.parent
          return data
        }
      )
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
}