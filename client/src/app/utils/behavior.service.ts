import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BehaviorService {

  private bookMarkOpen = new Subject<void>();

  bookMarkOpened = this.bookMarkOpen.asObservable()

  constructor() { }

  openBookmaks() {
    this.bookMarkOpen.next()
  }
}
