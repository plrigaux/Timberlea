import { A11yModule } from '@angular/cdk/a11y';
import { CdkTableModule } from '@angular/cdk/table';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BookmarkComponent } from './bookmark/bookmark.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { ControlsComponent } from './controls/controls.component';
import { DialogFileRename } from './controls/dialog-file-rename';
import { DialogFileInfo } from './controls/dialog-file-info';
import { FileDialogBoxComponent } from './file-dialog-box/file-dialog-box.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { HistoryComponent } from './history/history.component';
import { LongPressDirective } from './long-press.directive';
import { MenuComponent } from './menu/menu.component';
import { TableNavigatorComponent } from './table-navigator/table-navigator.component';
import { DialogDirectoryCreate } from './menu/dialog-directory-create';
import { DialogFileCreate } from './menu/dialog-file-create';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';

@NgModule({
  declarations: [
    AppComponent,
    FileUploadComponent,
    TableNavigatorComponent,
    FileDialogBoxComponent,
    LongPressDirective,
    ControlsComponent,
    DialogFileRename,
    DialogFileInfo,
    BreadcrumbComponent,
    MenuComponent,
    DialogDirectoryCreate,
    DialogFileCreate,
    BookmarkComponent,
    HistoryComponent,
    ImageViewerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MatButtonModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatMenuModule,
    MatTableModule,
    CdkTableModule,
    MatIconModule,
    MatProgressBarModule,
    MatToolbarModule,
    MatSortModule,
    A11yModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatTooltipModule,
    MatTabsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
