import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { FileDetails, MvFile_Response } from '../../../../server/src/common/interfaces';
import { DownloadFile, FileServerService } from '../utils/file-server.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
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

    this.subscriptions.push(this.fileServerService.subscribeDelete({
      next: (file: string) => {
        let item: HistoryItem = {
          action: HistAction.DELETE,
          data: file
        }

        this.addItem(item)
      }
    }))


    this.subscriptions.push(this.fileServerService.subscribeModif({
      next: (resp: MvFile_Response) => {

        let action: HistAction
        let data: string
        if (resp.newFileName === resp.oldFileName) {
          action = HistAction.MOVE
          data = `file  ${resp.newFileName} from ${resp.oldParent} to ${resp.parent}`
        } else {
          action = HistAction.RENAME
          data = `${resp.oldFileName} --> ${resp.newFileName}`
        }

        let item: HistoryItem = {
          action: action,
          data: data
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

  getIcon(item: HistoryItem): string {
    let caracteristic: HistActionCarac | undefined = histAction.get(item.action)

    if (caracteristic) {
      return caracteristic.icon
    }

    return "history"
  }

  getText(item: HistoryItem): string {
    let text: string = "";
    const lnt = 20

    if (item.data.length > (lnt - 3)) {

      text = `...${item.data.substring(item.data.length - (lnt - 3))}`
    } else {
      text = item.data
    }

    return text
  }

  isDisable(item: HistoryItem): boolean {
    let caracteristic: HistActionCarac | undefined = histAction.get(item.action)

    if (caracteristic) {
      return caracteristic.disable
    }

    return true
  }

  getTooltipMsg(item: HistoryItem): string {
    return `${item.action} ${item.data}`
  }
}

const LIMIT = 20

const HIST = "HIST"

enum HistAction {
  LIST = "LIST",
  DOWNLOAD = "DOWNLOAD",
  ZIP = "ZIP",
  UPLOAD = "UPLOAD",
  DELETE = "DELETE",
  RENAME = "RENAME",
  MOVE = "MOVE",
  COPY = "COPY"
}

interface HistoryItem {
  action: HistAction
  data: string
}

interface HistActionCarac {
  disable: boolean
  icon: string
}

const histAction = new Map<HistAction, HistActionCarac>([
  [HistAction.LIST, {
    disable: false,
    icon: "list"
  }],
  [HistAction.DOWNLOAD, {
    disable: false,
    icon: "file_download"
  }],
  [HistAction.ZIP, {
    disable: false,
    icon: "archive"
  }],
  [HistAction.UPLOAD, {
    disable: true,
    icon: "file_upload"
  }],
  [HistAction.DELETE, {
    disable: true,
    icon: "delete"
  }],
  [HistAction.RENAME, {
    disable: true,
    icon: "drive_file_rename_outline"
  }],
  [HistAction.MOVE, {
    disable: true,
    icon: "drive_file_move"
  }],
  [HistAction.COPY, {
    disable: true,
    icon: "content_copy"
  }]
]);
