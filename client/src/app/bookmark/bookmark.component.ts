import { Component, OnInit } from '@angular/core';
import { BehaviorService } from '../utils/behavior.service';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.scss']
})
export class BookmarkComponent implements OnInit {

  hasBackdrop = true

  constructor(private behavior : BehaviorService) { }

  ngOnInit(): void {

  }

}
