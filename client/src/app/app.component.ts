import { Component, ViewChild, OnInit } from '@angular/core';
import { ChangeDir_Response, FileDetails, FileList_Response, FileType } from '../../../server/src/common/interfaces';
import { endpoints } from '../../../server/src/common/constants';
import { environment } from '../../../client/src/environments/environment';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FileServerService } from './file-server.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  displayedColumns: string[] = ['type', 'name', 'size'];
  dataSource: MatTableDataSource<FileDetails>;


  cdPath: string = "common"
  fileName: string = ""
  remoteDirectory = ""
  //remoteFiles: FileDetails[] = []
  serverUrl: string

  @ViewChild(MatSort) sort!: MatSort;

  constructor(private _liveAnnouncer: LiveAnnouncer,
    private fileServerService: FileServerService) {
    this.serverUrl = environment.serverUrl

    this.dataSource = new MatTableDataSource([] as FileDetails[]);
  }


  ngOnInit(): void {
    this.list()
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }


  pwd() {
    console.log("click PWD")
    this.fileServerService.pwd().then((response: ChangeDir_Response) => { this.list() })
  }


  cd() {
    this.cdRelPath(this.cdPath)
  }

  cdRelPath(relPath: string) {
    this.fileServerService.cdRelPath(relPath).then((response: ChangeDir_Response) => {
      if (response.files) {
        this.updateDataSource(response);
      } else {
        this.list()
      }
    })
  }

  list() {
    this.fileServerService.list().then((response: FileList_Response) => {
      this.updateDataSource(response);
    })
  }

  private updateDataSource(data: FileList_Response) {
    if (data.files) {
      let remoteFiles = [{ name: '..', type: FileType.Directory }, ...data.files]

      this.dataSource = new MatTableDataSource(remoteFiles)
      this.dataSource.sort = this.sort
    }
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
