import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiBaseResponse,
  ApiItemResponse,
  ApiPaginateResponse,
} from '../../common/http/types';
import { Order } from './types';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) {}
  private apiUrl = environment.apiUrl;

  getOrders<DTO>(params?: DTO): Observable<ApiPaginateResponse<Order>> {
    const queryParams = new HttpParams({ fromObject: params as any });
    return this.http.get<ApiPaginateResponse<Order>>(`${this.apiUrl}/order`, {
      params: queryParams,
    });
  }

  getOrder(id: string): Observable<ApiItemResponse<Order>> {
    return this.http.get<ApiItemResponse<Order>>(`${this.apiUrl}/order/${id}`);
  }

  createOrder(body: any): Observable<ApiItemResponse<Order>> {
    return this.http.post<ApiItemResponse<Order>>(`${this.apiUrl}/order`, body);
  }

  updateOrder(body: any, id: string): Observable<ApiItemResponse<Order>> {
    return this.http.put<ApiItemResponse<Order>>(
      `${this.apiUrl}/order/${id}`,
      body
    );
  }

  deleteOrder(id: string): Observable<ApiBaseResponse<Order>> {
    return this.http.delete<ApiBaseResponse<Order>>(
      `${this.apiUrl}/order/${id}`
    );
  }
}
