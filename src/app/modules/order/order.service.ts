import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface Product {
  productId: string;
  name: string;
  price: number;
  stock: number;
}

interface ProductItem {
  productId: string;
  count: number;
}
export interface Order {
  _id: string;
  name: string;
  phoneNumber: string;
  email: string;
  products?: ProductItem[];
  totalAmount?: number;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private http: HttpClient) {}

  private apiUrl = 'http://localhost:3000';
  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/order`);
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

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/product`);
  }
}
