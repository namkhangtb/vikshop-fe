import { Component } from '@angular/core';
import { Order, OrderService } from '../order.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DeleteComponent } from '../delete/delete.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DeleteComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  constructor(private orderService: OrderService, private router: Router) {}
  items: Order[] = [];
  isOpenDeleteModal: boolean = false;
  orderIdDelete: string = '';

  ngOnInit() {
    this.fetchOrders();
  }

  goToEditOrder(item: any) {
    this.router.navigate([`/order/update/${item._id}`]);
  }

  openDeleteModal(item: any) {
    this.isOpenDeleteModal = true;
    this.orderIdDelete = item._id;
  }
  closeDeleteModal(event: any) {
    this.isOpenDeleteModal = event;
  }

  handleDeleted(success: boolean) {
    this.isOpenDeleteModal = false;
    if (success) {
      this.fetchOrders();
    }
  }

  fetchOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.items = data;
      },
      error: (err) => console.error('Lỗi khi lấy dữ liệu', err),
    });
  }
}
