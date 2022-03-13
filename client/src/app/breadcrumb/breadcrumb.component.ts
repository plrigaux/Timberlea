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
  private re = "/"

  constructor(private fileServerService: FileServerService) { }

  ngOnInit(): void {
    this.fileServerService.subscribeRemoteDirectory({
      next: (remoteDirectory: string) => {
        this.setUpChips(remoteDirectory);
      }

    })

    //init empty
    this.setUpChips("");
  }

  clickChip(chip: PathChip) {
    console.log("chip", chip)

    this.fileServerService.list(chip.path)
  }

  private setUpChips(remoteDirectory: string) {
    this.remoteDirectory = remoteDirectory;

    let newPathChip: PathChip[] = [];
    //this.pathChip = []
    let pcRoot: PathChip = {
      name: "🏠",
      path: "",
      selected: false
    };

    newPathChip.push(pcRoot);

    if (remoteDirectory !== "") {
      let path = "";
      let splittedRemoteDir = remoteDirectory.split(this.re);

      //set the path for each chips
      splittedRemoteDir.forEach((dirName) => {
        if (path.length > 0) {
          path += "/" + dirName;
        } else {
          path = dirName;
        }

        let pathChip: PathChip;
        pathChip = {
          name: dirName,
          path: path,
          selected: false
        };

        newPathChip.push(pathChip);
      });

      if (newPathChip.length >= 0) {
        newPathChip[newPathChip.length - 1].selected = true;
      }
    } else {
      pcRoot.selected = true;
    }

    let newLength = newPathChip.length;
    let oldLength = this.pathChip.length;

    console.log("new", newLength, newPathChip);
    console.log("old", oldLength, this.pathChip);

    if (newLength < oldLength) {
      let oldNextPath = this.pathChip[newLength].path;
      let lastNewPath = newPathChip[newLength - 1].path;

      if (oldNextPath.startsWith(lastNewPath)) {
        for (let i = newLength; i < oldLength; i++) {
          this.pathChip[i].selected = false;
          newPathChip.push(this.pathChip[i]);
        }
      }
    }

    this.pathChip = newPathChip;
  }
}

interface PathChip {
  name: string;
  path: string;
  selected: boolean
}
