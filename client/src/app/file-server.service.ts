import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ChangeDir_Request, ChangeDir_Response, FileDetails, FileList_Response, FS_Response, MvFile_Request, MvFile_Response, RemFile_Request, RemFile_Response } from '../../../server/src/common/interfaces';
import { environment } from '../../../client/src/environments/environment';
import { endpoints } from '../../../server/src/common/constants';
import { catchError, Observable, Observer, of, retry, Subject, Subscription, tap, throwError, throwIfEmpty } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileServerService {


  private serverUrl: string
  private rd = ""

  get remoteDirectory() {
    return this.rd
  }

  private set remoteDirectory(rd : string) {
    console.warn("rd", rd)
    this.rd = rd
  }

  private newList = new Subject<FileDetails[]>()
  private newRemoteDirectory = new Subject<string>()
  private waiting = new Subject<boolean>()
  private deleteSub = new Subject<string>()
  private selectFileSub = new Subject<FileDetailsPlus | null>()
  private modifSubjet = new Subject<MvFile_Response>()
  private newFileSubjet = new Subject<FileDetails>()

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

  subscribeSelectFileSub(obs: Partial<Observer<FileDetailsPlus | null>>): Subscription {
    return this.selectFileSub.subscribe(obs)
  }

  subscribeModif(obs: Partial<Observer<MvFile_Response>>): Subscription {
    return this.modifSubjet.subscribe(obs)
  }

  subscribeNewFileSubjet(obs: Partial<Observer<FileDetails>>): Subscription {
    return this.newFileSubjet.subscribe(obs)
  }

  addNewFile(file: FileDetails): void {
    this.newFileSubjet.next(file)
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

  cd(relPath: string, remoteDirectory: string | null = null, returnList = true): void {
    this.waiting.next(true)
    let newRemoteDirectory: ChangeDir_Request = {
      remoteDirectory: remoteDirectory ? remoteDirectory : this.remoteDirectory,
      newPath: relPath,
      returnList: returnList
    }

    console.log("path:", newRemoteDirectory)

    this.http.put<ChangeDir_Response>(this.serverUrl + endpoints.FS_CD, newRemoteDirectory).pipe(
      tap((data: ChangeDir_Response) => {
        this.setRemoteDirectory(data)
      }),
      //retry(2),
      catchError((e) => this.handleError(e as HttpErrorResponse))
    ).subscribe(
      {
        next: (data: ChangeDir_Response) => {
          let files: FileDetails[] = data.files ? data.files : []
          this.waiting.next(false)
          this.newList.next(files)
        },
        error: (e: any) => {
          console.error(e)
          this.newList.error(e)
          this.waiting.next(false)
        }
      })
  }

  list(path: string | null = null): void {
    this.waiting.next(true)

    if (path === null) {
      path = this.remoteDirectory
    } 

    let remoteDirectory = encodeURIComponent(path);

    const url = this.serverUrl + endpoints.FS_LIST + "/" + remoteDirectory

    this.http.get<FileList_Response>(url).pipe(
      tap((data: FileList_Response) => {
        this.setRemoteDirectory(data)
      }),
      //retry(2),
      catchError((e) => this.handleError(e as HttpErrorResponse))

    ).subscribe(
      {
        next: (data: FileList_Response) => {
          this.newList.next(data.files ?? [])
          this.waiting.next(false)
        },
        error: e => {
          console.error(e)
          this.newList.error(e)
          this.waiting.next(false)
        }
      })
  }

  private setRemoteDirectory(data: ChangeDir_Response) {
    if (!data.error) {
      this.remoteDirectory = data.parent
      this.newRemoteDirectory.next(this.remoteDirectory)
    }
  }

  getRemoteDirectory(): string {
    return this.remoteDirectory
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }

    /*
    let fl: FS_Response = {
      error: true,
      message: 'Something bad happened; please try again later.'
    }
    return of(fl)
    */

    return throwError(() => new Error('Something bad happened; please try again later.'))
  }

  getFileHref(fileName: string): string {
    const href = environment.serverUrl + endpoints.FS_DOWNLOAD + "/" + encodeURIComponent(this.remoteDirectory + "/" + fileName);
    return href
  }

  delete(fileName: string | null | undefined) {
    if (!fileName) {
      return;
    }


    let request: RemFile_Request = {
      parent: this.remoteDirectory,
      fileName: fileName,
    }

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      body: request,
    };

    let ob = this.http.delete<RemFile_Response>(this.serverUrl + endpoints.FS_REM, options).pipe(
      tap((data: RemFile_Response) => {
        this.setRemoteDirectory(data)
      }),
      retry(2),
      catchError((e) => this.handleError(e as HttpErrorResponse))
    )

    ob.subscribe(
      {
        next: (data: RemFile_Response) => {
          this.deleteSub.next(fileName)
        },
        error: e => {
          console.error(e)
        }
      })
  }

  selectFile(file: FileDetails | null) {
    let fdp: FileDetailsPlus = file as FileDetailsPlus
    if (file) {
      fdp.directory = this.remoteDirectory
    }
    this.selectFileSub.next(fdp)
  }

  copyPaste(copySelect: FileDetailsPlus) {
    console.log(`COPY ${copySelect.name} from ${copySelect.directory} to ${this.remoteDirectory}`)
  }


  renameFile(fileName: string | null | undefined, newFileName: string | null | undefined) {

    if (!(fileName && newFileName)) {
      return
    }

    let request: MvFile_Request = {
      parent: this.remoteDirectory,
      fileName: fileName,
      newFileName: newFileName
    }

    this.move(request)
  }

  cutPaste(cutSelect: FileDetailsPlus) {
    console.log(`CUT ${cutSelect.name} from ${cutSelect.directory} to ${this.remoteDirectory}`)

    let request: MvFile_Request = {
      parent: cutSelect.directory,
      fileName: cutSelect.name,
      newParent: this.remoteDirectory
    }
    this.move(request)
  }

  private move(request: MvFile_Request) {

    let ob = this.http.put<MvFile_Response>(this.serverUrl + endpoints.FS_MV, request).pipe(
      tap((data: MvFile_Response) => {
        this.setRemoteDirectory(data)
      }),
      catchError((e) => this.handleError(e as HttpErrorResponse))
    )

    ob.subscribe(
      {
        next: (data: MvFile_Response) => {
          this.modifSubjet.next(data)
        },
        error: e => {
          console.error(e)
          this.modifSubjet.error(e)
        }
      })
  }

}

export interface FileDetailsPlus extends FileDetails {
  directory: string
}