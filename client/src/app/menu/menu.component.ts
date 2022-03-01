import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
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

  constructor(private fileServerService: FileServerService, private _dialog: MatDialog) {

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
}

@Component({
  selector: 'dialog-directory-create',
  templateUrl: 'dialog-directory-create.html',
  providers: [{ provide: ErrorStateMatcher, useClass: DirtyErrorStateMatcher }]
})
export class DialogDirectoryCreate implements AfterViewInit {

  newFileName: FormControl

  @ViewChild('newFileInput', { static: true }) newFileInput!: ElementRef;

  constructor(@Inject(MAT_DIALOG_DATA) public data: FileDetailsPlus) {
    this.newFileName = new FormControl("", { validators: [Validators.required, forbiddenCharValidator()], updateOn: 'change' });
  }

  ngAfterViewInit(): void {
    console.log(this.newFileInput)


    setTimeout(() => {

      let fileName: string = this.newFileName.value

      let lastPoint = fileName.lastIndexOf(".")
      if (lastPoint > 0) {
        this.newFileInput.nativeElement.setSelectionRange(0, lastPoint)
      }
      this.newFileInput.nativeElement.focus()
    }, 0);
  }

}