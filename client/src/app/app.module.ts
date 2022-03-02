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
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { ControlsComponent, DialogFileInfo, DialogFileRename } from './controls/controls.component';
import { FileDialogBoxComponent } from './file-dialog-box/file-dialog-box.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { LongPressDirective } from './long-press.directive';
import { MenuComponent, DialogDirectoryCreate, DialogFileCreate } from './menu/menu.component';
import { TableNavigatorComponent } from './table-navigator/table-navigator.component';


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
    DialogFileCreate
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
