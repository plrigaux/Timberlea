import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FileDetails, FileType } from '../../../../server/src/common/interfaces';
import { FileServerService } from '../utils/file-server.service';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit {


  constructor(public dialogRef: MatDialogRef<ImageViewerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ImageInfo,
    private fileServerService: FileServerService ) {
 
  }

  isPdf() :boolean{
    return this.data.fileName.endsWith(".pdf")
  }

  ngOnInit(): void {
  }

  download() {
    this.fileServerService.downloadFileName(this.data.fileName)
  }

  static imageRE = /\.jpg|\.jpeg|\.png|\.gif|\.bmp/

  private list: string[] | null = null
  private index = -1

  getList(): string[] {
    if (!this.list) {
      this.list = []
      this.data.list.forEach(fd => {
        if (fd.type === FileType.File) {
          if (fd.name.match(ImageViewerComponent.imageRE)) {
            this.list?.push(fd.name)
          }
        }
      })
    }

    return this.list
  }

  next() {
    let fileList = this.getList()

    this.data.fileName = fileList[this.incIndex()]
  }

  previous() {
    let fileList = this.getList()

    this.data.fileName = fileList[this.decIndex()]
  }

  getHref(): string {
    return this.fileServerService.getFileNameHref(this.data.fileName)
  }

  incIndex(): number {
    let list = this.getList()
    if (this.index < 0) {
      this.index = list.indexOf(this.data.fileName)
    }
    this.index++
    this.normalizeIndex(list)
    return this.index
  }

  private normalizeIndex(list: string[]) {
    if (this.index >= list.length) {
      this.index = 0
    } else if (this.index < 0) {
      this.index = list.length - 1
    }
  }

  decIndex(): number {
    let list = this.getList()
    if (this.index < 0) {
      this.index = list.indexOf(this.data.fileName)
    }
    this.index--
    this.normalizeIndex(list)
    return this.index
  }

  openInNewTab() {
    let image = new Image();
    image.src = this.getHref()

    let w = window.open("");
    if (w) {
      w.document.write(image.outerHTML);
    }
  }

  btnResize = ORIGINAL_SIZE_LABEL
  imgClass = FIT_CLASS

  resize() {
    if (this.btnResize == ORIGINAL_SIZE_LABEL) {
      this.btnResize = FIT_SIZE_LABEL
      this.imgClass = ORIGINAL_CLASS
    } else {
      this.btnResize = ORIGINAL_SIZE_LABEL
      this.imgClass = FIT_CLASS
    }
  }
}

const ORIGINAL_SIZE_LABEL = "Original"
const FIT_SIZE_LABEL = "Fit"
const ORIGINAL_CLASS = ""
const FIT_CLASS = "fit"

export interface ImageInfo {
  fileName: string
  list: FileDetails[]
}
