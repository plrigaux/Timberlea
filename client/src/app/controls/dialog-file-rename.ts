import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FileDetailsPlus } from "../utils/file-server.service";
import { DirtyErrorStateMatcher, forbiddenCharValidator } from "../utils/utils";

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