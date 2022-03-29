import { AfterViewInit, Component } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { MatDialogRef } from "@angular/material/dialog";
import { DirtyErrorStateMatcher, forbiddenCharValidator } from "../utils/utils";
import { FileNameContent } from "./menuInt";

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