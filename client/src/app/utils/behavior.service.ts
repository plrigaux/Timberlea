import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FileDetails } from '../../../../server/src/common/interfaces';
import { FileDetailsPlus } from './file-server.service';

@Injectable({
  providedIn: 'root'
})
export class BehaviorService {


  private bookMarkOpen = new Subject<void>();

  bookMarkOpened = this.bookMarkOpen.asObservable()

  private makeBookmark = new Subject<FileDetails>();

  makeBookmark$ = this.makeBookmark.asObservable()


  constructor() { }

  openBookmaks() {
    this.bookMarkOpen.next()
  }

  bookmark(file: FileDetailsPlus) {
    this.makeBookmark.next(file)
  }
}
