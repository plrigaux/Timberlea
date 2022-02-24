import { Component, ViewChild, OnInit } from '@angular/core';
import { ChangeDir_Response, FileDetails, FileList_Response, FileType } from '../../../server/src/common/interfaces';
import { environment } from '../../../client/src/environments/environment';
import { FileServerService } from './file-server.service';


interface PathChip {
  name: string;
  path: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  cdPath: string = "common"
  fileName: string = ""
  remoteDirectory = ""
  //remoteFiles: FileDetails[] = []
  serverUrl: string
  pathChip: PathChip[] = []
  private re = /[\/]/

  constructor(
    private fileServerService: FileServerService) {
    this.serverUrl = environment.serverUrl
  }

  ngOnInit(): void {

    this.fileServerService.subscribeRemoteDirectory({
      next: (remoteDirectory: string) => {
        this.remoteDirectory = remoteDirectory
        this.pathChip = []

        let pc: PathChip = {
          name: "🏠",
          path: ""
        }
        this.pathChip.push(pc)

        if (remoteDirectory === "") {
          return
        }
        
        let path = ""
        let splittedRemoteDir = remoteDirectory.split(this.re)
        //console.log("splittedRemoteDir", remoteDirectory, splittedRemoteDir)

        splittedRemoteDir.forEach(s => {
          if (path.length > 0) {
            path += "/" + s
          } else {
            path = s
          }

          let pc: PathChip 
            pc = {
              name: s,
              path: path
            }

          this.pathChip.push(pc)
        })

      }
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

  clickChip(chip: PathChip) {
    console.log("chip", chip)

    this.fileServerService.list(chip.path)
  }
}
