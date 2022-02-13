import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileDetails } from '../../../../server/src/common/interfaces';
import { FileDetailsPlus, FileServerService } from '../file-server.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit {

  fileDetails: FileDetailsPlus | null = null
  cutCopyPaste = false
  cutSelect: FileDetailsPlus | null = null
  copySelect: FileDetailsPlus | null = null

  constructor(private fileServerService: FileServerService,
    private _dialog: MatDialog) { }

  ngOnInit(): void {
    this.fileServerService.subscribeSelectFileSub({
      next: (fileDetail: FileDetailsPlus | null) => {
        this.fileDetails = fileDetail
      }
    })
  }

  showFileCommands(): boolean {
    return this.fileDetails != null && !this.cutCopyPaste
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
    if(this.copySelect) {
      this.fileServerService.copyPaste(this.copySelect)
      this.copySelect = null
    }

    if(this.cutSelect) {
      this.fileServerService.cutPaste(this.cutSelect)
      this.cutSelect = null
    }
  }

  info() {
    console.log('Info clicked');
    const dialog = this._dialog.open(DialogDataExampleDialog, {
      width: '350px',
      // Can be closed only by clicking the close button
      disableClose: false,
      data: this.fileDetails
    });
  }
}


@Component({
  selector: 'dialog-file-info',
  templateUrl: 'dialog-file-info.html',
})
export class DialogDataExampleDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: FileDetailsPlus) { }
}
