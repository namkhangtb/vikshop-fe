import { Component, ViewChild, TemplateRef } from '@angular/core';
import { ProductService } from '../product.service';
import { Router } from '@angular/router';
import { Product } from '../types';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { CreateComponent } from '../create/create.component';
import { UpdateComponent } from '../update/update.component';
import {
  faPenToSquare,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, CreateComponent, UpdateComponent, FontAwesomeModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  items: Product[] = [];
  isOpenDeleteModal: boolean = false;
  productIdDelete: string = '';
  urlImage: string = environment.apiUrl + '/uploads/';

  modalRef?: BsModalRef;
  selectedProduct: any = {};

  faPlus = faPlus;
  faPenToSquare = faPenToSquare;
  faTrash = faTrash;

  constructor(
    private productService: ProductService,
    private router: Router,
    private modalService: BsModalService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.fetchProducts();
  }

  goToEditProduct(item: any) {
    this.router.navigate([`/product/update/${item._id}`]);
  }

  openAddProductModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }
  openUpdateProductModal(template: TemplateRef<any>, item: any) {
    this.selectedProduct = item;
    this.modalRef = this.modalService.show(template);
  }
  openDeleteModal(template: TemplateRef<any>, item: any) {
    this.selectedProduct = item;
    this.modalRef = this.modalService.show(template);
  }
  closeDeleteModal(event: any) {
    this.isOpenDeleteModal = event;
  }

  handleDeleted(success: boolean) {
    this.isOpenDeleteModal = false;
    if (success) {
      this.fetchProducts();
    }
  }

  onProductAdded() {
    this.fetchProducts();
    this.modalRef?.hide();
  }

  onProductUpdated() {
    this.fetchProducts();
    this.modalRef?.hide();
  }

  confirmDeleteProduct() {
    this.productService.deleteProduct(this.selectedProduct._id).subscribe({
      next: () => {
        this.fetchProducts();
        this.modalRef?.hide();
        this.toastr.success('Xóa sản phẩm thành công!');
      },
      error: (err) => {
        console.error('Lỗi khi xóa sản phẩm', err);
        this.modalRef?.hide();
        this.toastr.error('Xóa sản phẩm thất bại!');
      },
    });
  }

  fetchProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.items = data;
      },
      error: (err) => console.error('Lỗi khi lấy dữ liệu', err),
    });
  }
}
