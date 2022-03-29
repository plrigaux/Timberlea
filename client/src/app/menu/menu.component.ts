import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { BehaviorService } from '../utils/behavior.service';
import { FileServerService } from '../utils/file-server.service';
import { DialogDirectoryCreate } from './dialog-directory-create';
import { DialogFileCreate } from './dialog-file-create';
import { FileNameContent } from './menuInt';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = []
  private remoteDirectory = ""
  createFolderDisable: boolean = false
  createFileDisable: boolean = false

  constructor(private fileServerService: FileServerService, private _dialog: MatDialog,
    private behavior: BehaviorService) {

  }

  ngOnInit(): void {
    this.subscriptions.push(this.fileServerService.subscribeRemoteDirectory({
      next: (data: string) => {
        this.remoteDirectory = data

        if (this.remoteDirectory === "") {
          this.createFolderDisable = true
          this.createFileDisable = true
        } else {
          this.createFolderDisable = false
          this.createFileDisable = false
        }
      }
    }))
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.subscriptions = []
  }

  newFolder() {
    console.log('Info clicked');
    const dialog = this._dialog.open(DialogDirectoryCreate, {
      width: '350px',
      // Can be closed only by clicking the close button
      disableClose: false,
      data: null
    });

    dialog.afterClosed().subscribe(result => {
      console.log('The dialog was closed', result);

      this.fileServerService.newFolder(result)
    });
  }

  newFile() {
    console.log('Info clicked');
    const dialog = this._dialog.open(DialogFileCreate, {
      width: '350px',
      // Can be closed only by clicking the close button
      disableClose: false,
      data: null
    });

    dialog.afterClosed().subscribe((result: FileNameContent) => {
      console.log('The dialog was closed', result);

      this.fileServerService.newFile(result.fileName, result.fileContent)
    });
  }

  onOpenBookmarks() {
    this.behavior.openBookmaks(true)
  }

  onOpenHistory() {
    this.behavior.openHistory(true)
  }
}