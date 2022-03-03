import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, Observable, Observer, retry, Subject, Subscription, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { endpoints } from '../../../../server/src/common/constants';
import {
  ChangeDir_Request, ChangeDir_Response, FileDetails, FileDetail_Response, FileList_Response,
  MakeDirRequest,
  MakeDirResponse,
  MakeFileRequest,
  MakeFileResponse,
  MvFile_Request, MvFile_Response, RemFile_Request, RemFile_Response
} from '../../../../server/src/common/interfaces';


@Injectable({
  providedIn: 'root'
})
export class FileServerService {


  private serverUrl: string
  private rd = ""

  get remoteDirectory() {
    return this.rd
  }

  private set remoteDirectory(rd: string) {
    console.warn("rd", rd)
    this.rd = rd
  }

  private newList = new Subject<FileDetails[]>()
  private newRemoteDirectory = new Subject<string>()
  private waitingSubject = new Subject<boolean>()
  private deleteSubject = new Subject<string>()
  private selectFileSubject = new Subject<FileDetailsPlus | null>()
  private modifSubject = new Subject<MvFile_Response>()
  private newFileSubject = new Subject<FileDetails>()
  private newFolderSubject = new Subject<string>()

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) {
    this.serverUrl = environment.serverUrl
  }

  subscribeFileList(obs: Partial<Observer<FileDetails[]>>): Subscription {
    return this.newList.subscribe(obs)
  }

  subscribeRemoteDirectory(obs: Partial<Observer<string>>): Subscription {
    return this.newRemoteDirectory.subscribe(obs)
  }

  subscribeWaiting(obs: Partial<Observer<boolean>>): Subscription {
    return this.waitingSubject.subscribe(obs)
  }

  subscribeDelete(obs: Partial<Observer<string>>): Subscription {
    return this.deleteSubject.subscribe(obs)
  }

  subscribeSelectFileSub(obs: Partial<Observer<FileDetailsPlus | null>>): Subscription {
    return this.selectFileSubject.subscribe(obs)
  }

  subscribeModif(obs: Partial<Observer<MvFile_Response>>): Subscription {
    return this.modifSubject.subscribe(obs)
  }

  subscribeNewFileSubjet(obs: Partial<Observer<FileDetails>>): Subscription {
    return this.newFileSubject.subscribe(obs)
  }

  subscribeNewFolderSubject(obs: Partial<Observer<string>>): Subscription {
    return this.newFolderSubject.subscribe(obs)
  }

  addNewFile(file: FileDetails): void {
    this.newFileSubject.next(file)
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
    this.waitingSubject.next(true)
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
          this.newList.next(files)
        },
        error: (e: any) => {

        }
      })
  }

  list(path: string | null = null): void {
    this.waitingSubject.next(true)

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
        },
        error: e => {

        }
      })
  }

  private setRemoteDirectory(data: ChangeDir_Response | null) {
    if (data && !data.error) {
      this.remoteDirectory = data.parent
      this.newRemoteDirectory.next(this.remoteDirectory)
    }
    this.waitingSubject.next(false)
  }

  getRemoteDirectory(): string {
    return this.remoteDirectory
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = ""
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      message = 'An error occurred:', error.error
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      message =
        `${error.status} - ${error.statusText}},\n body was: ${JSON.stringify(error.error)}`
    }

    this._snackBar.open(message, "Close", {
      duration: 10 * 1000,
    })
    this.waitingSubject.next(false)

    return throwError(() => new Error(message))
  }

  getFileHref(fileName: string): string {
    const href = environment.serverUrl + endpoints.FS_DOWNLOAD + "/" + encodeURIComponent(this.remoteDirectory + "/" + fileName);
    return href
  }

  delete(fileName: string | null | undefined) {
    if (!fileName) {
      return;
    }

    this.waitingSubject.next(true)
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
          this.deleteSubject.next(fileName)
        },
        error: e => {

        }
      })
  }

  selectFile(file: FileDetails | null) {
    let fdp: FileDetailsPlus = file as FileDetailsPlus
    if (file) {
      fdp.directory = this.remoteDirectory
    }
    this.selectFileSubject.next(fdp)
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

    this.http.put<MvFile_Response>(this.serverUrl + endpoints.FS_MV, request).pipe(
      tap((data: MvFile_Response) => {
        this.setRemoteDirectory(data)
      }),
      catchError((e) => this.handleError(e as HttpErrorResponse))
    ).subscribe(
      {
        next: (data: MvFile_Response) => {
          this.modifSubject.next(data)
        },
        error: e => {

        }
      })
  }


  newFolder(directoryName: string | null | undefined) {
    if (!directoryName) {
      return;
    }

    this.waitingSubject.next(true)
    let request: MakeDirRequest = {
      parent: this.remoteDirectory,
      dirName: directoryName,
    }

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    this.http.post<MakeDirResponse>(this.serverUrl + endpoints.FS_MKDIR, request, options).pipe(
      tap((data: MakeDirResponse) => {
        this.setRemoteDirectory(null)
      }),
      //retry(2),
      catchError((e) => this.handleError(e as HttpErrorResponse))
    ).subscribe({
      next: (data: MakeDirResponse) => {
        this.newFolderSubject.next(data.dirName)
      },
      error: e => {

      }
    })
  }

  newFile(fileName: string | null | undefined, fileContent: string | null | undefined) {
    if (!fileName) {
      return;
    }

    if (!fileContent) {
      fileContent = "";
    }

    this.waitingSubject.next(true)
    let request: MakeFileRequest = {
      parent: this.remoteDirectory,
      fileName: fileName,
    }

    if (fileContent) {
      request.data = fileContent
    }

    const options = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };

    this.http.post<FileDetail_Response>(this.serverUrl + endpoints.FS_MKFILE, request, options).pipe(
      tap((data: FileDetail_Response) => {
        this.setRemoteDirectory(null)
      }),
      //retry(2),
      catchError((e) => this.handleError(e as HttpErrorResponse))
    ).subscribe({
      next: (data: FileDetail_Response) => {
        this.addNewFile(data.file)
      },
      error: e => {

      }
    })
  }

}

export interface FileDetailsPlus extends FileDetails {
  directory: string
}