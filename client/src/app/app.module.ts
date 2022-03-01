import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { CdkTableModule } from '@angular/cdk/table';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSortModule } from "@angular/material/sort"
import { A11yModule } from '@angular/cdk/a11y';
import { TableNavigatorComponent } from './table-navigator/table-navigator.component';
import { FileDialogBoxComponent } from './file-dialog-box/file-dialog-box.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LongPressDirective } from './long-press.directive';
import { MatChipsModule } from '@angular/material/chips';
import { ControlsComponent, DialogFileInfo, DialogFileRename } from './controls/controls.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { MatMenuModule } from '@angular/material/menu';
import { MenuComponent } from './menu/menu.component';

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
    MenuComponent
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
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
