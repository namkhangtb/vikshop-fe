import { Component, TemplateRef } from '@angular/core';
import { OrderService } from '../order.service';
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
import { ToastrService } from 'ngx-toastr';
import { Order } from '../types';
import { DeleteModalComponent } from '@shared/components';

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
    DeleteModalComponent,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  constructor(
    private orderService: OrderService,
    private modalService: BsModalService,
    private toastr: ToastrService
  ) {}

  faPlus = faPlus;
  faPenToSquare = faPenToSquare;
  faTrash = faTrash;

  modalRef?: BsModalRef;
  selectedOrder: Order = {} as Order;

  items: Order[] = [];
  page = 1;
  pageSize = 10;
  totalItems = 0;
  searchText: string = '';

  ngOnInit() {
    this.fetchOrders();
  }

  fetchOrders() {
    this.orderService
      .getOrders({ page: this.page, limit: this.pageSize, keyword: this.searchText})
      .subscribe({
        next: (res) => {
          this.items = res.data;
          this.totalItems = res.meta.pagination.totalItems;
        },
        error: (err) => console.error('Lỗi khi lấy dữ liệu', err),
      });
  }

  onSearchChange() {
    this.fetchOrders();
  }

  pageChanged(event: any) {
    this.page = event.page;
    this.fetchOrders();
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

  cancelDeleteOrder() {
    this.modalRef?.hide();
  }

  confirmDeleteOrder() {
    console.log('Xác nhận xóa đơn hàng', this.selectedOrder);

    if (!this.selectedOrder?._id) return;
    this.orderService.deleteOrder(this.selectedOrder._id).subscribe({
      next: () => {
        this.fetchOrders();
        this.modalRef?.hide();
        this.toastr.success('Xóa đơn hàng thành công!');
      },
      error: (err) => {
        console.error('Lỗi khi xóa đơn hàng', err);
        this.modalRef?.hide();
        this.toastr.error('Xóa đơn hàng thất bại!');
      },
    });
  }
}
