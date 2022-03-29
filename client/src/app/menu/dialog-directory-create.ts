import { AfterViewInit, Component, Inject } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FileDetailsPlus } from "../utils/file-server.service";
import { DirtyErrorStateMatcher, forbiddenCharValidator } from "../utils/utils";

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
  

  
  