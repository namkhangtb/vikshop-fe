import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiPaginateResponse } from '../../common/http/types';
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

  getOrder(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/order/${id}`);
  }

  createOrder(body: any): Observable<Order> {
    return this.http.post<Order>(`${this.apiUrl}/order`, body);
  }

  updateOrder(body: any, id: string): Observable<Order> {
    return this.http.put<Order>(`${this.apiUrl}/order/${id}`, body);
  }

  deleteOrder(id: string): Observable<Order> {
    return this.http.delete<Order>(`${this.apiUrl}/order/${id}`);
  }
}
