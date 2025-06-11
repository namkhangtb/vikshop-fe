import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Product } from './types';
import { environment } from '../../../environments/environment';
import {
  ApiBaseResponse,
  ApiItemResponse,
  ApiPaginateResponse,
} from '../../common/http/types';

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

  getProduct(id: string): Observable<ApiItemResponse<Product>> {
    return this.http.get<ApiItemResponse<Product>>(
      `${this.apiUrl}/product/${id}`
    );
  }

  createProduct(body: any): Observable<ApiItemResponse<Product>> {
    return this.http.post<ApiItemResponse<Product>>(
      `${this.apiUrl}/product`,
      body
    );
  }

  updateProduct(body: any, id: string): Observable<ApiItemResponse<Product>> {
    return this.http.put<ApiItemResponse<Product>>(
      `${this.apiUrl}/product/${id}`,
      body
    );
  }

  deleteProduct(id: string): Observable<ApiBaseResponse<Product>> {
    return this.http.delete<ApiBaseResponse<Product>>(
      `${this.apiUrl}/product/${id}`
    );
  }
}
