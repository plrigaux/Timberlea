import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { FileType } from '../../../../server/src/common/interfaces';
import { BehaviorService } from '../utils/behavior.service';
import { FileDetailsPlus, FileServerService, SelectFileContext } from '../utils/file-server.service';
import { DialogFileInfo } from './dialog-file-info';
import { DialogFileRename } from './dialog-file-rename';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit, OnDestroy {

  private fileDetails: FileDetailsPlus | null = null
  cutCopyPaste = false
  cutSelect: FileDetailsPlus | null = null
  copySelect: FileDetailsPlus | null = null
  private subscriptions: Subscription[] = []

  @Input()
  controlAligment: string = "HORIZONTAL"

  @Input()
  id: string = "bottom"

  callerId: string | null = null

  constructor(private fileServerService: FileServerService,
    private _dialog: MatDialog,
    private behavior: BehaviorService) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.fileServerService.subscribeSelectFileSub({
        next: (fileContextDetail: SelectFileContext | null) => {
          if (fileContextDetail) {
            this.fileDetails = fileContextDetail.file
            this.callerId = fileContextDetail.controlID
          } else {
            this.fileDetails = null
            this.callerId = null
          }
        }
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.subscriptions = []
  }

  getClass(): string {
    if (this.controlAligment === "VERTICAL") {
      return "buttonVertical"
    }
    return ""
  }

  showFileCommands(): boolean {
    return (this.id === this.callerId) && (this.fileDetails != null && !this.cutCopyPaste)
  }

  delete() {
    this.fileServerService.delete(this.fileDetails?.name)
  }

  copy() {
    this.cutCopyPaste = true
    this.copySelect = this.fileDetails
  }

  cut() {
    this.cutCopyPaste = true
    this.cutSelect = this.fileDetails
  }

  cancelPaste() {
    this.cutCopyPaste = false
    this.copySelect = this.cutSelect = null
  }

  paste() {
    this.cutCopyPaste = false
    if (this.copySelect) {
      this.fileServerService.copyPaste(this.copySelect)
      this.copySelect = null
    }

    if (this.cutSelect) {
      this.fileServerService.cutPaste(this.cutSelect)
      this.cutSelect = null
    }
  }

  info() {
    const dialog = this._dialog.open(DialogFileInfo, {
      width: '350px',
      // Can be closed only by clicking the close button
      disableClose: false,
      data: this.fileDetails
    });
  }

  editName() {
    const dialog = this._dialog.open(DialogFileRename, {
      width: '350px',
      // Can be closed only by clicking the close button
      disableClose: false,
      data: this.fileDetails
    });


    dialog.afterClosed().subscribe(result => {
      this.fileServerService.renameFile(this.fileDetails?.name, result)
    });
  }

  bookmark() {
    if (this.fileDetails) {
      this.behavior.bookmark(this.fileDetails)
    }
  }

  downloadZip() {
    let filename = this.fileDetails?.name
    if (filename) {
      this.fileServerService.downloadFileName(filename, true)
    }
  }

  download() {
    let filename = this.fileDetails?.name
    if (filename) {
      this.fileServerService.downloadFileName(filename, false)
    }
  }

  isDisabled(button: string): boolean {

    if (this.fileServerService.isHome()) {
      return true;
    }

    switch (button) {
      case "download":
        return this.fileDetails?.type === FileType.Directory

    }

    return false
  }
}