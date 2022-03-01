import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FileServerService } from '../file-server.service';

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

  constructor(private fileServerService: FileServerService) {

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

}
