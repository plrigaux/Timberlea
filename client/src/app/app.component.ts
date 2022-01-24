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
export class AppComponent  {

  cdPath: string = "common"
  fileName: string = ""
  remoteDirectory = ""
  //remoteFiles: FileDetails[] = []
  serverUrl: string



  constructor(
    private fileServerService: FileServerService) {
    this.serverUrl = environment.serverUrl

  
  }

  pwd() {
    console.log("click PWD")
    this.fileServerService.pwd().then((response: ChangeDir_Response) => { this.fileServerService.list() })
  }


  cd() {
    this.cdRelPath(this.cdPath)
  }

  cdRelPath(relPath: string) {
    this.fileServerService.cdRelPath(relPath).then((response: ChangeDir_Response) => {
      if (response.files) {
        //this.updateDataSource(response);
      } else {
        this.fileServerService.list()
      }
    })
  }

  list() {
    this.fileServerService.list()
  }

  downloadFile() {
    //this.downloadFileName(this.fileName)
  }

  setCdPath(param: FileDetails) {
    if (param.type == FileType.Directory) {
      this.cdPath = param.name
    } else if (param.type == FileType.File) {
      this.fileName = param.name
    }
  }

  
}
