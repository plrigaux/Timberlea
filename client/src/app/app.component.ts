import { Component, ViewChild, OnInit } from '@angular/core';
import { ChangeDir_Response, FileDetails, FileList_Response, FileType } from '../../../server/src/common/interfaces';
import { endpoints } from '../../../server/src/common/constants';
import { environment } from '../../../client/src/environments/environment';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { FileServerService } from './file-server.service';
import { MatChip } from '@angular/material/chips';


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
  re = /[\/\\]/

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
          name: "HOME",
          path: ""
        }
        this.pathChip.push(pc)
        
        let path = ""
        remoteDirectory.split(this.re).forEach(s => {
          if (path.length > 0) {
            path = path + "/"
          }

          path = path + s
          let pc: PathChip = {
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
    console.log(chip)

    this.fileServerService.list(chip.path)
  }


}
