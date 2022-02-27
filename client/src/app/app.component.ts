import { Component, ViewChild, OnInit } from '@angular/core';
import { ChangeDir_Response, FileDetails, FileList_Response, FileType } from '../../../server/src/common/interfaces';
import { environment } from '../../../client/src/environments/environment';
import { FileServerService } from './file-server.service';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  cdPath: string = "common"
  fileName: string = ""

  //remoteFiles: FileDetails[] = []
  serverUrl: string

  constructor(
    private fileServerService: FileServerService) {
    this.serverUrl = environment.serverUrl
  }

  ngOnInit(): void {

  }

  pwd() {
    console.log("click PWD")
    this.fileServerService.pwd();
  }


  cd() {
    this.cdRelPath(this.cdPath)
  }

  cdRelPath(relPath: string) {
    this.fileServerService.cd(relPath)
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
