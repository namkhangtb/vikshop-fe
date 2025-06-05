import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  uploadFile(file: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<{ uploaded: string }>(`${this.apiUrl}/upload`, formData)
      .pipe(map((res) => res.uploaded));
  }

  deleteFile(filename: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/upload/${filename}`);
  }

}
