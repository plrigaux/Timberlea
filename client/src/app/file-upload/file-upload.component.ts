import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { finalize, Subscription } from 'rxjs';
import { endpoints, uploadFile } from '../../../../server/src/common/constants';
import { FileDetails, FileType } from '../../../../server/src/common/interfaces';
import { environment } from '../../environments/environment';
import { FileServerService } from '../file-server.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {


  ngOnInit(): void {

  }

  @Input()
  requiredFileType!: string;

  fileName = '';
  uploadProgress: number | null = null;
  uploadSub: Subscription | null = null;

  constructor(private http: HttpClient, private fileServerService: FileServerService) { }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;

    //console.warn(files)

    Array.from(files).forEach(file => {
      this.uploadFile(file);
    })
  }

  private uploadFile(file: File) {
    console.warn("upload", file)
    this.fileName = file.name;
    const formData = new FormData();
    formData.append(uploadFile.DESTINATION_FOLDER, this.fileServerService.getRemoteDirectory())
    formData.append(this.fileName, file); //File needs to be last


    const upload$ = this.http.post(environment.serverUrl + endpoints.FS_UPLOAD, formData, {
      reportProgress: true,
      observe: 'events',
      responseType: 'text'
    }).pipe(
      finalize(() => this.reset(file))
    );

    this.uploadSub = upload$.subscribe(event => {
      if (event.type == HttpEventType.UploadProgress && event.total) {
        this.uploadProgress = Math.round(100 * (event.loaded / event.total));
      }
    })

  }

  cancelUpload() {
    if (this.uploadSub) {
      this.uploadSub.unsubscribe();
    }
    this.reset();
  }

  private reset(file: File | null = null) {
    this.uploadProgress = null;
    this.uploadSub = null;

    if (file) {

      let fileDetails : FileDetails = {
        name: file.name,
        type: FileType.File
      }

      this.fileServerService.addNewFile(fileDetails)
    }
    //this.fileServerService.list();
  }
}
