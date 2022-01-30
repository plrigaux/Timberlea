import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChangeDir_Request, ChangeDir_Response, FileDetails, FileList_Response } from '../../../server/src/common/interfaces';
import { environment } from '../../../client/src/environments/environment';
import { endpoints } from '../../../server/src/common/constants';
import { catchError, Observable, Observer, of, retry, Subject, Subscription, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileServerService {

  serverUrl: string
  remoteDirectory = ""

  private newList = new Subject<FileDetails[]>()
  private newRemoteDirectory = new Subject<string>()
  private waiting = new Subject<boolean>()
  private deleteSub = new Subject<string>()

  constructor(private http: HttpClient) {
    this.serverUrl = environment.serverUrl
  }

  subscribeFileList(obs: Partial<Observer<FileDetails[]>>): Subscription {
    return this.newList.subscribe(obs)
  }

  subscribeRemoteDirectory(obs: Partial<Observer<string>>): Subscription {
    return this.newRemoteDirectory.subscribe(obs)
  }

  subscribeWaiting(obs: Partial<Observer<boolean>>): Subscription {
    return this.waiting.subscribe(obs)
  }

  subscribeDelete(obs: Partial<Observer<string>>): Subscription {
    return this.deleteSub.subscribe(obs)
  }

  pwd(): void {
    console.log("click PWD")

    this.http.get<ChangeDir_Response>(this.serverUrl + endpoints.FS_PWD).pipe(
      tap((data: ChangeDir_Response) => {
        this.setRemoteDirectory(data)
      }),
      retry(2),
      catchError((e) => this.handleError(e as HttpErrorResponse))
    )
  }

  cd(relPath: string, remoteDirectory : string | null = null, returnList = true): void {

    let newRemoteDirectory: ChangeDir_Request = {
      remoteDirectory: remoteDirectory ? remoteDirectory : this.remoteDirectory,
      newPath: relPath,
      returnList: returnList
    }

    console.log("path: " + newRemoteDirectory)

    this.http.put<ChangeDir_Response>(this.serverUrl + endpoints.FS_CD, newRemoteDirectory).pipe(
      tap((data: ChangeDir_Response) => {
        this.setRemoteDirectory(data)
      }),
      retry(2),
      catchError((e) => this.handleError(e as HttpErrorResponse))
    ).subscribe(
      {
        next: (data: ChangeDir_Response) => {
          let files: FileDetails[] = data.files ? data.files : []
          this.newList.next(files)
        },
        error: (e: any) => {
          console.error(e)
          this.newList.error(e)
        }
      })
  }

  list(path: string | null = null): void {
    this.waiting.next(true)
    let remoteDirectory = encodeURIComponent(path ? path : this.remoteDirectory);

    this.http.get<FileList_Response>(this.serverUrl + endpoints.FS_LIST + "/" + remoteDirectory).pipe(
      tap((data: FileList_Response) => {
        this.setRemoteDirectory(data)
      }),
      retry(2),
      catchError((e) => this.handleError(e as HttpErrorResponse))
    ).subscribe(
      {
        next: (data: FileList_Response) => {
          let files: FileDetails[] = data.files ? data.files : []
          this.newList.next(files)
        },
        error: e => {
          console.error(e)
          this.newList.error(e)
        }
      })
  }

  private setRemoteDirectory(data: ChangeDir_Response) {
    if (!data.error) {
      this.remoteDirectory = data.parent
      this.newRemoteDirectory.next(this.remoteDirectory)
    }
  }

  private handleError(error: HttpErrorResponse): Observable<FileList_Response> {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }

    let fl: FileList_Response = {
      parent: '',
      error: true,
      message: 'Something bad happened; please try again later.'
    }
    return of(fl)

  }

  getFileHref(fileName: string): string {
    const href = environment.serverUrl + endpoints.FS_DOWNLOAD + "/" + encodeURIComponent(this.remoteDirectory + "/" + fileName);

    return href
  }

  delete(fileName: string) {
    this.deleteSub.next(fileName)
  }

}