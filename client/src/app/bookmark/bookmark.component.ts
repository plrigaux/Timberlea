import { Component, OnInit } from '@angular/core';
import { FileDetails, FileDetailsEnhanced } from '../../../../server/src/common/interfaces';
import { BehaviorService } from '../utils/behavior.service';
import { FileDetailsPlus, FileServerService } from '../utils/file-server.service';

@Component({
  selector: 'app-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.scss']
})
export class BookmarkComponent implements OnInit {

  hasBackdrop = true

  bookmarks: FileDetailsPlus[] = []

  constructor(private behavior: BehaviorService, private fss: FileServerService) { }

  ngOnInit(): void {
    this.behavior.makeBookmark$.subscribe((file: FileDetailsPlus) => {

      let newFile: FileDetailsPlus = {
        directory: file.directory,
        name: file.name,
        type: file.type
      }

      this.bookmarks.push(newFile)

      let bkmString = JSON.stringify(this.bookmarks)
      localStorage.setItem(FILE_BOOKMARKS, bkmString)
    })

    let bms = localStorage.getItem(FILE_BOOKMARKS)
    if (bms) {
      let storedBookmarks = JSON.parse(bms)
      this.bookmarks = storedBookmarks
    }
  }

  onBookmarkClick(file: FileDetailsPlus) {
    console.log("file", file)
    this.fss.cd(file.name, file.directory)
    this.behavior.openBookmaks(false)
  }

  remove(i : number) {
    this.bookmarks.splice(i, 1)

    let bkmString = JSON.stringify(this.bookmarks)
    localStorage.setItem(FILE_BOOKMARKS, bkmString)
  }

  displayTooltip(file: FileDetailsPlus) : string {
    return file.directory + "/" + file.name
  }

  displayBookmark(file: FileDetailsPlus) : string {
    const NBCHAR = 16

    if (file.name.length > (NBCHAR + 3)) {
      return file.name.slice(0, NBCHAR) + "..."
    }
    
    return file.name
  }
}

const FILE_BOOKMARKS = "FILE_BOOKMARKS"
