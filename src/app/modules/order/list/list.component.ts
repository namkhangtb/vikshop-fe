import { Component, TemplateRef } from '@angular/core';
import { Order, OrderService } from '../order.service';
import { CommonModule } from '@angular/common';
import {
  faPenToSquare,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule } from '@angular/forms';
import { CreateComponent } from '../create/create.component';
import { UpdateComponent } from '../update/update.component';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    FontAwesomeModule,
    PaginationModule,
    FormsModule,
    CreateComponent,
    UpdateComponent,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  constructor(
    private orderService: OrderService,
    private modalService: BsModalService
  ) {}

  faPlus = faPlus;
  faPenToSquare = faPenToSquare;
  faTrash = faTrash;

  modalRef?: BsModalRef;
  selectedOrder: Order = {} as Order;

  items: Order[] = [];

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.items = data;
      },
      error: (err) => console.error('Lỗi khi lấy dữ liệu', err),
    });
  }

  openAddOrderModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  onOrderAdded() {
    this.fetchOrders();
    this.modalRef?.hide();
  }

  openUpdateOrderModal(template: TemplateRef<any>, item: Order) {
    this.selectedOrder = item;
    this.modalRef = this.modalService.show(template);
  }

  onOrderUpdated() {
    this.fetchOrders();
    this.modalRef?.hide();
  }

  openDeleteModal(template: TemplateRef<any>, item: any) {
    this.selectedOrder = item;
    this.modalRef = this.modalService.show(template);
  }

  confirmDeleteOrder() {
    if (!this.selectedOrder?._id) return;
    this.orderService.deleteOrder(this.selectedOrder._id).subscribe({
      next: () => {
        this.fetchOrders();
        this.modalRef?.hide();
      },
      error: (err) => {
        console.error('Lỗi khi xóa đơn hàng', err);
        this.modalRef?.hide();
      },
    });
  }
}
