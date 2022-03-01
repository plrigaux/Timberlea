import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { endpoints } from '../../../../server/src/common/constants';
@Injectable({
    providedIn: 'root'
})
export class FileUploadService {

    // API url
    baseApiUrl = environment.serverUrl + endpoints.FS_UPLOAD

    constructor(private http: HttpClient) { }

    // Returns an observable
    upload(file: File): Observable<any> {

        // Create form data
        const formData = new FormData();

        // Store form name as "file" with file data
        formData.append("file", file, file.name);

        // Make http post request over api
        // with formData as req
        return this.http.post(this.baseApiUrl, formData)
    }
}