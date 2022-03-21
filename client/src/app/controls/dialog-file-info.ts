import { Component, Inject } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FileDetailsPlus } from "../utils/file-server.service";

@Component({
    selector: 'dialog-file-info',
    templateUrl: 'dialog-file-info.html',
  })
  export class DialogFileInfo {
    constructor(@Inject(MAT_DIALOG_DATA) public data: FileDetailsPlus) { }
  }
  