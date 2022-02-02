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

  fileDetail: FileDetailsPlus | null = null
  cutPaste = false

  constructor(private fileServerService: FileServerService,
    private _dialog: MatDialog) { }

  ngOnInit(): void {
    this.fileServerService.subscribeSelectFileSub({
      next: (fileDetail: FileDetailsPlus | null) => {
        this.fileDetail = fileDetail
      }
    })
  }

  showFileCommands(): boolean {
    return this.fileDetail != null && !this.cutPaste
  }

  delete() {

  }

  copy() {
    this.cutPaste = true
  }

  cut() {
    this.cutPaste = true
  }

  cancelPaste() {
    this.cutPaste = false
  }

  paste() {
    this.cutPaste = false
  }

  info() {
    console.log('Info clicked');
    const dialog = this._dialog.open(DialogDataExampleDialog, {
      width: '350px',
      // Can be closed only by clicking the close button
      disableClose: false,
      data: this.fileDetail
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
