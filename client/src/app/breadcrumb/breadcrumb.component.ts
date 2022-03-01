import { Component, OnInit } from '@angular/core';
import { FileServerService } from '../utils/file-server.service';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  private remoteDirectory = ""
  pathChip: PathChip[] = []
  private re = /\//

  constructor(private fileServerService: FileServerService) { }

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

  clickChip(chip: PathChip) {
    console.log("chip", chip)

    this.fileServerService.list(chip.path)
  }
}

interface PathChip {
  name: string;
  path: string
}
