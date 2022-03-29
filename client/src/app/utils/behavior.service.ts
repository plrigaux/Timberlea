import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FileDetails } from '../../../../server/src/common/interfaces';
import { FileDetailsPlus } from './file-server.service';

@Injectable({
  providedIn: 'root'
})
export class BehaviorService {
 

  private bookMarkOpen = new Subject<boolean>();
  bookMarkOpened = this.bookMarkOpen.asObservable()

  private historyOpen = new Subject<boolean>();
  historyOpened = this.historyOpen.asObservable()

  private makeBookmark = new Subject<FileDetailsPlus>();

  makeBookmark$ = this.makeBookmark.asObservable()

  constructor() { }

  openBookmaks(open : boolean) {
    this.bookMarkOpen.next(open)
  }

  openHistory(open: boolean) {
    this.historyOpen.next(open)
  }

  bookmark(file: FileDetailsPlus) {
    this.makeBookmark.next(file)
  }
}
