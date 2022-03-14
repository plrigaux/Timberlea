import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FileDetails } from '../../../../server/src/common/interfaces';
import { DownloadFile, FileServerService } from '../utils/file-server.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = []
  constructor(private fileServerService: FileServerService) { }

  historyItems: HistoryItem[] = []

  ngOnInit(): void {
    this.subscriptions.push(this.fileServerService.subscribeFileList({
      next: (filelist: FileDetails[]) => {
        let item: HistoryItem = {
          action: HistAction.LIST,
          data: this.fileServerService.remoteDirectory
        }

        this.addItem(item)
      }
    }))

    this.subscriptions.push(this.fileServerService.subscribeDownloadFile({
      next: (file: DownloadFile) => {
        let item: HistoryItem = {
          action: file.archive ? HistAction.ZIP : HistAction.DOWNLOAD,
          data: file.path
        }

        this.addItem(item)
      }
    }))

    this.subscriptions.push(this.fileServerService.subscribeNewFile({
      next: (file: FileDetails) => {
        let item: HistoryItem = {
          action: HistAction.UPLOAD,
          data: file.name
        }

        this.addItem(item)
      }
    }))

    let hist = localStorage.getItem(HIST)

    if (hist) {
      let parsedHistory = JSON.parse(hist)
      this.historyItems = parsedHistory
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.subscriptions = []
  }

  private addItem(item: HistoryItem) {

    if (item.action == HistAction.LIST) {
      if (item.data === "") {
        //This is HOME and we don't track (for now...)
        return
      }
    }

    while (this.historyItems.length >= LIMIT) {
      this.historyItems.shift()
    }

    if (this.historyItems.length) {
      let lastItem = this.historyItems[this.historyItems.length - 1]

      if (this.objectsEqual(lastItem, item)) {
        return
      }
    }

    this.historyItems.push(item)
    localStorage.setItem(HIST, JSON.stringify(this.historyItems))
  }

  onHistoryClick(item: HistoryItem) {
    switch (item.action) {
      case HistAction.LIST:
        this.fileServerService.list(item.data)
        break;
      case HistAction.DOWNLOAD:
        this.fileServerService.downloadFilePath(item.data, false)
        break;
      case HistAction.ZIP:
        this.fileServerService.downloadFilePath(item.data, true)
        break;

      case HistAction.UPLOAD:

        break;
      default:
    }
  }

  objectsEqual(o1: any, o2: any) {
    const entries1 = Object.entries(o1);
    const entries2 = Object.entries(o2);

    if (entries1.length !== entries2.length) {
      return false;
    }

    for (let i = 0; i < entries1.length; ++i) {
      // Keys
      if (entries1[i][0] !== entries2[i][0]) {
        return false;
      }
      // Values
      if (entries1[i][1] !== entries2[i][1]) {
        return false;
      }
    }

    return true;
  }

}

const LIMIT = 20

const HIST = "HIST"

enum HistAction {
  LIST = "LIST",
  DOWNLOAD = "DOWNLOAD",
  ZIP = "ZIP",
  UPLOAD = "UPLOAD"
}

interface HistoryItem {
  action: HistAction
  data: string
}
