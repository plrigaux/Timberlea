import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { FileDetails, FileList_Response, FileType, MvFile_Response } from '../../../../server/src/common/interfaces';
import { FileDialogBoxComponent } from '../file-dialog-box/file-dialog-box.component';
import { FileServerService } from '../file-server.service';

@Component({
  selector: 'app-table-navigator',
  templateUrl: './table-navigator.component.html',
  styleUrls: ['./table-navigator.component.scss']
})
export class TableNavigatorComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatTable) table!: MatTable<any>;

  displayedColumns: string[] = ['type', 'name', 'size', 'dateModif'];

  dateFormat: Intl.DateTimeFormat
  timeFormat: Intl.DateTimeFormat
  isLoadingResults: boolean = false
  dataSource: MatTableDataSource<FileDetails>;
  private subscriptions: Subscription[] = []
  private waitCount = 0

  constructor(private fileServerService: FileServerService,
    private _liveAnnouncer: LiveAnnouncer,
    private _dialog: MatDialog) {

    this.dataSource = new MatTableDataSource([] as FileDetails[]);

    let dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'numeric', year: 'numeric' };
    let timeOptions: Intl.DateTimeFormatOptions = { hourCycle: "h24", hour: 'numeric', minute: '2-digit' };

    this.dateFormat = Intl.DateTimeFormat('default', dateOptions)
    this.timeFormat = Intl.DateTimeFormat('default', timeOptions)
  }

  ngOnInit(): void {

    this.subscriptions.push(this.fileServerService.subscribeFileList({
      next: (filelist: FileDetails[]) => {
        this.updateDataSource(filelist)
      }
    }))

    this.subscriptions.push(this.fileServerService.subscribeWaiting({
      next: (wait: boolean) => {
        this.isLoadingResults = wait
        if (wait) {
          this.waitCount++;
        } else {
          this.waitCount--;
        }
        console.log("wait spinner: ", wait, this.waitCount)
      }
    }))

    this.subscriptions.push(this.fileServerService.subscribeDelete({
      next: (fileName: string) => {
        console.log("delete file", fileName)
        const index = this.dataSource.data.findIndex((element) => element.name == fileName)

        console.log("delete file", fileName, index)
        if (index > -1) {
          console.log("delete file", this.dataSource.data.length)
          this.dataSource.data.splice(index, 1)

          let remoteFiles = this.dataSource.data
          this.updateDataSource2(remoteFiles);
        }
      }
    }))

    this.subscriptions.push(this.fileServerService.subscribeModif({
      next: (data: MvFile_Response) => {
        data.newFileName

        let fdIndex = this.dataSource.data.findIndex(fd => fd.name === data.oldFileName)
        if (fdIndex >= 0) {
          let fd = this.dataSource.data[fdIndex]
          fd.name = data.newFileName
        } else {
          let remoteFiles = this.dataSource.data
          remoteFiles.push({ name: data.newFileName, type: FileType.File })

          this.updateDataSource2(remoteFiles);
        }

        if(this.selectedRowIndex ==data.oldFileName ) {
          this.selectedRowIndex = data.newFileName
        }
        
        if(this.selectedRowIndex2 ==data.oldFileName ) {
          this.selectedRowIndex2 = data.newFileName
        }
      }
    }))

    this.subscriptions.push(this.fileServerService.subscribeNewFileSubjet({
      next: (data: FileDetails) => {
        console.log("f upload", data)

        let remoteFiles = this.dataSource.data
        remoteFiles.push(data)

        this.updateDataSource2(remoteFiles);
      }
    }
    ))

    this.list()
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.subscriptions.length = 0
  }

  list() {
    this.fileServerService.list()
  }

  private updateDataSource(filelist: FileDetails[]) {

    let remoteFiles : FileDetails[]
    if (this.fileServerService.getRemoteDirectory() != "") {
       remoteFiles = [{ name: '..', type: FileType.Directory }, ...filelist]
    } else {
       remoteFiles = filelist
    }
    
    this.updateDataSource2(remoteFiles);
  }

  private updateDataSource2(filelist: FileDetails[]) {
    console.log("updateDataSource2", filelist)
    this.dataSource = new MatTableDataSource(filelist)
    this.dataSource.sort = this.sort
    this.table.renderRows()
    this.isLoadingResults = false
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

  highlightRow(row: any) {
    console.log(row)
  }

  displayType(e: FileDetails): string {
    return FileType[e.type]
  }

  displayDateModified(e: FileDetails): string {
    if (e.mtime) {
      let date = new Date(e.mtime)
      return this.dateFormat.format(date) + " " + this.timeFormat.format(date)
    }
    return ""
  }

  displayTypeIcon(e: FileDetails): string {
    switch (e.type) {
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
      this.fileServerService.cd(element.name)
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

  openDialog(element: FileDetails) {

    console.log('Action clicked', element);
    const dialog = this._dialog.open(FileDialogBoxComponent, {
      width: '250px',
      // Can be closed only by clicking the close button
      disableClose: false,
      data: element
    });
  }

  selectedRowIndex: string | null = null;
  selectedRowIndex2: string | null = null;

  onLongPressRow(row: FileDetails) {
    console.log("onLongPress", row)
    this.selectedRowIndex2 = row.name
  }

  onClickRow(row: FileDetails) {
    console.log("onLongClick", row)
    if (this.selectedRowIndex != row.name) {
      this.fileServerService.selectFile(null)
      this.selectedRowIndex = null
    }
    this.selectedRowIndex2 = null
  }

  onLongPressingRow(fileDetails: FileDetails) {
    console.log("onLongPressing",fileDetails)
    if (this.selectedRowIndex != fileDetails.name) { //to limit the number of calls
      this.selectedRowIndex = fileDetails.name
      this.fileServerService.selectFile(fileDetails)
    }
  }
}
