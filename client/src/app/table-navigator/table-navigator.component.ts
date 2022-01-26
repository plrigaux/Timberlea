import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FileDetails, FileList_Response, FileType } from '../../../../server/src/common/interfaces';
import { FileServerService } from '../file-server.service';

@Component({
  selector: 'app-table-navigator',
  templateUrl: './table-navigator.component.html',
  styleUrls: ['./table-navigator.component.scss']
})
export class TableNavigatorComponent implements OnInit, AfterViewInit {

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['type', 'name', 'size'];

  dataSource: MatTableDataSource<FileDetails>;

  constructor(private fileServerService: FileServerService,
    private _liveAnnouncer: LiveAnnouncer) {

    this.dataSource = new MatTableDataSource([] as FileDetails[]);
  }

  ngOnInit(): void {

    this.fileServerService.subscribeFileList({
      next : (filelist : FileDetails[]) => {
        this.updateDataSource(filelist)
      }
    })


    this.list()
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }


  list() {
    this.fileServerService.list()
  }

  private updateDataSource(filelist: FileDetails[]) {
      let remoteFiles = [{ name: '..', type: FileType.Directory }, ...filelist]
      this.dataSource = new MatTableDataSource(remoteFiles)
      this.dataSource.sort = this.sort
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

  setCdPath(param: FileDetails) {
    if (param.type == FileType.Directory) {
      //this.cdPath = param.name
    } else if (param.type == FileType.File) {
      //this.fileName = param.name
    }
  }

  elementClick(element: FileDetails) {
    if (element.type == FileType.Directory) {
      this.fileServerService.cdRelPath(element.name)
    } else if (element.type == FileType.File) {
      this.downloadFileName(element.name)
    }
  }



  downloadFileName(fileName: string) {

    const href = this.fileServerService.getFileHref(fileName);

    const link = document.createElement('a');
    link.setAttribute('target', '_blank');
    link.setAttribute('href', href);
    link.setAttribute('download', fileName);
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


}