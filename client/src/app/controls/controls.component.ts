import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { FileDetails } from '../../../../server/src/common/interfaces';
import { FileDetailsPlus, FileServerService } from '../file-server.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit, OnDestroy {

  fileDetails: FileDetailsPlus | null = null
  cutCopyPaste = false
  cutSelect: FileDetailsPlus | null = null
  copySelect: FileDetailsPlus | null = null
  private subscriptions: Subscription[] = []

  constructor(private fileServerService: FileServerService,
    private _dialog: MatDialog) { }

  ngOnInit(): void {
    this.subscriptions.push(
      this.fileServerService.subscribeSelectFileSub({
        next: (fileDetail: FileDetailsPlus | null) => {
          this.fileDetails = fileDetail
        }
      })
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
    this.subscriptions = []
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
    console.log('Info clicked');
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
      console.log('The dialog was closed', result);

      this.fileServerService.renameFile(this.fileDetails?.name, result)
    });
  }
}

@Component({
  selector: 'dialog-file-info',
  templateUrl: 'dialog-file-info.html',
})
export class DialogFileInfo {
  constructor(@Inject(MAT_DIALOG_DATA) public data: FileDetailsPlus) { }
}


export function forbiddenCharValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = /[\/\\\<\>\"?\:\*]/.test(control.value);


    return forbidden ? { forbiddenChar: { value: control.value } } : null;
  };
}



export class DirtyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}

@Component({
  selector: 'dialog-file-rename',
  templateUrl: 'dialog-file-rename.html',
  providers: [{ provide: ErrorStateMatcher, useClass: DirtyErrorStateMatcher }]
})
export class DialogFileRename implements AfterViewInit {

  newFileName: FormControl

  @ViewChild('newFileInput', { static: true }) newFileInput!: ElementRef;

  constructor(@Inject(MAT_DIALOG_DATA) public data: FileDetailsPlus) {
    this.newFileName = new FormControl(data.name, { validators: [Validators.required, forbiddenCharValidator()], updateOn: 'change' });
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