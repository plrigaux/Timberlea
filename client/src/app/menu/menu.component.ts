import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { BehaviorService } from '../utils/behavior.service';
import { FileDetailsPlus, FileServerService } from '../utils/file-server.service';

import { DirtyErrorStateMatcher, forbiddenCharValidator } from '../utils/utils';

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
}

@Component({
  selector: 'dialog-directory-create',
  templateUrl: 'dialog-directory-create.html',
  styleUrls: ['./menu.component.scss'],
  providers: [{ provide: ErrorStateMatcher, useClass: DirtyErrorStateMatcher }]
})
export class DialogDirectoryCreate implements AfterViewInit {

  newFileName: FormControl


  constructor(@Inject(MAT_DIALOG_DATA) public data: FileDetailsPlus) {
    this.newFileName = new FormControl("", { validators: [Validators.required, forbiddenCharValidator()], updateOn: 'change' });
  }

  ngAfterViewInit(): void {

  }
}

interface FileNameContent {
  fileName: string
  fileContent: string

}

@Component({
  selector: 'dialog-file-create',
  templateUrl: 'dialog-file-create.html',
  styleUrls: ['./menu.component.scss'],
  providers: [{ provide: ErrorStateMatcher, useClass: DirtyErrorStateMatcher }]
})
export class DialogFileCreate implements AfterViewInit {

  newFileName: FormControl
  fileContent: FormControl = new FormControl("")

  constructor(private dialogRef: MatDialogRef<DialogFileCreate, FileNameContent>,) {
    this.newFileName = new FormControl("", { validators: [Validators.required, forbiddenCharValidator()], updateOn: 'change' });
  }

  ngAfterViewInit(): void {

  }

  onCancelClick() {
    this.dialogRef.close()
  }

  onOkClick() {
    let output: FileNameContent = {
      fileName: this.newFileName.value,
      fileContent: this.fileContent.value
    }
    this.dialogRef.close(output)
  }


}