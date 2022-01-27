import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileDetails, FileType } from '../../../../server/src/common/interfaces';

@Component({
  selector: 'app-file-dialog-box',
  templateUrl: './file-dialog-box.component.html',
  styleUrls: ['./file-dialog-box.component.scss']
})
export class FileDialogBoxComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<FileDialogBoxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FileDetails) { }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  displayTypeIcon(): string {
    switch (this.data.type) {
      case FileType.Directory:
        return "folder"
    }
    return "text_snippet"
  }
}
