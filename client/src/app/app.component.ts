import { Component, ViewChild, OnInit } from '@angular/core';
import { ChangeDir_Response, FileDetails, FileList_Response, FileType } from '../../../server/src/common/interfaces';
import { environment } from '../../../client/src/environments/environment';
import { FileServerService } from './utils/file-server.service';
import { BehaviorService } from './utils/behavior.service';

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
  sidebar_open = false

  constructor(
    private fileServerService: FileServerService,
    private behavior : BehaviorService) {
    this.serverUrl = environment.serverUrl
 
  }

  ngOnInit(): void {
    this.behavior.bookMarkOpened.subscribe((open : boolean) => {
      this.sidebar_open = open
    }) 
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
