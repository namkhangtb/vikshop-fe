import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from './types';
import { environment } from '../../../environments/environment';
import { ApiPaginateResponse } from '../../common/http/types';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;

  getProducts<DTO>(params?: DTO): Observable<ApiPaginateResponse<Product>> {
    const queryParams = new HttpParams({ fromObject: params as any });
    return this.http.get<ApiPaginateResponse<Product>>(
      `${this.apiUrl}/product`,
      {
        params: queryParams,
      }
    );
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/product/${id}`);
  }

  createProduct(body: any): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/product`, body);
  }

  updateProduct(body: any, id: string): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/product/${id}`, body);
  }

  deleteProduct(id: string): Observable<Product> {
    return this.http.delete<Product>(`${this.apiUrl}/product/${id}`);
  }
}
