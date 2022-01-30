import { Component, OnInit } from '@angular/core';
import { FileDetails } from '../../../../server/src/common/interfaces';
import { FileDetailsPlus, FileServerService } from '../file-server.service';

@Component({
  selector: 'app-controls',
  templateUrl: './controls.component.html',
  styleUrls: ['./controls.component.scss']
})
export class ControlsComponent implements OnInit {

  fileDetail: FileDetailsPlus | null = null
  
  constructor(private fileServerService: FileServerService) { }

  ngOnInit(): void {
    this.fileServerService.subscribeSelectFileSub({
      next: (fileDetail: FileDetailsPlus | null) => {
        this.fileDetail = fileDetail
      }
    })
  }

  delete() {

  }
}
