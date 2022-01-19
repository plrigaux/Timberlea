import { Component, ViewChild } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { ChangeDir_Request, ChangeDir_Response, FileDetails, FileList_Response, FileType } from '../../../server/src/common/interfaces';
import { endpoints } from '../../../server/src/common/constants';
import { Router } from '@angular/router';
import { environment } from '../../../client/src/environments/environment';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  displayedColumns: string[] = ['type', 'name', 'size'];
  dataSource: MatTableDataSource<FileDetails>;


  cdPath: string = "common"
  fileName: string = ""
  remoteDirectory = ""
  //remoteFiles: FileDetails[] = []
  serverUrl: string

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private http: HttpClient, private router: Router, private _liveAnnouncer: LiveAnnouncer) {
    this.serverUrl = environment.serverUrl

    this.dataSource = new MatTableDataSource([] as FileDetails[]);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }


  pwd() {
    console.log("click PWD")

    this.http.get<ChangeDir_Response>(this.serverUrl + endpoints.FS_PWD).subscribe({
      next: (data: ChangeDir_Response) => {
        console.log(data)
        this.remoteDirectory = data.parent
        this.list()
      },
      error: error => {
        //this.errorMessage = error.message;
        console.error('There was an error!', error);
      }
    })
  }


  cd() {
    this.cdRelPath(this.cdPath)
  }

  cdRelPath(relPath: string) {
    let newRemoteDirectory: ChangeDir_Request = {
      remoteDirectory: this.remoteDirectory,
      newPath: relPath,
      returnList: true
    }

    console.log("path: " + newRemoteDirectory)

    this.http.put<ChangeDir_Response>(this.serverUrl + endpoints.FS_CD, newRemoteDirectory).subscribe({
      next: (data: ChangeDir_Response) => {
        console.log(data)
        this.remoteDirectory = data.parent
        //this.remoteFiles = []


        if (data.files) {
          this.updateDataSource(data);
        } else {
          this.list()
        }
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

    this.http.get<FileList_Response>(this.serverUrl + endpoints.FS_LIST + "/" + remoteDirectory).subscribe({
      next: (data: FileList_Response) => {
        console.log(data)
        this.remoteDirectory = data.parent
        this.updateDataSource(data);
      },
      error: error => {
        //this.errorMessage = error.message;
        console.error('There was an error!', error);
      }
    })
  }

  private updateDataSource(data: FileList_Response) {
    if (data.files) {
      let remoteFiles = [{ name: '..', type: FileType.Directory }, ...data.files]

     
      this.dataSource.data = remoteFiles;
    }
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

  fileNameCSS(e: FileDetails): string {
    let cssClass = "file"
    if (e.type == FileType.Directory) {
      cssClass = "directory"
    }
    return cssClass;
  }


  elementClick(element: FileDetails) {
    if (element.type == FileType.Directory) {
      this.cdRelPath(element.name)
    } else if (element.type == FileType.File) {
      this.downloadFileName(element.name)
    }
  }

  setCdPath(param: FileDetails) {
    if (param.type == FileType.Directory) {
      this.cdPath = param.name
    } else if (param.type == FileType.File) {
      this.fileName = param.name
    }
  }

  downloadFile() {
    this.downloadFileName(this.fileName)
  }



  downloadFileName(fileName: string) {
    const href = environment.serverUrl + endpoints.FS_DOWNLOAD + "/" + encodeURIComponent(this.remoteDirectory) + "/" + encodeURIComponent(fileName);
    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', href);
    link.setAttribute('download', this.fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  displaySize(param: FileDetails): string {

    let size = ""
    if (param.type == FileType.File && param.size) {
      size = this.humanFileSize(param.size, true)
    }
    return size;
  }

  private humanFileSize(bytes: number, si = false, dp = 1) {

    const thresh = si ? 1000 : 1024;

    if (Math.abs(bytes) < thresh) {
      return bytes + ' B';
    }

    const units = si
      ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

    let u = -1;

    const r = 10 ** dp;

    do {
      bytes /= thresh;
      ++u;
    } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);


    return bytes.toFixed(dp) + ' ' + units[u];
  }

  /** Announce the change in sort state for assistive technology. */
  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}
