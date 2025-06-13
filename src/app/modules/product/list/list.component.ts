import { Component, TemplateRef } from '@angular/core';
import { ProductService } from '../product.service';
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
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastrService } from 'ngx-toastr';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule } from '@angular/forms';
import { DeleteModalComponent, ImageViewerComponent } from '@shared/components';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    CreateComponent,
    UpdateComponent,
    FontAwesomeModule,
    PaginationModule,
    FormsModule,
    DeleteModalComponent,
    ImageViewerComponent,
  ],
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
  faSearch = faSearch;

  page = 1;
  pageSize = 10;
  totalItems = 0;
  searchText: string = '';
  private searchTextChanged = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private modalService: BsModalService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.fetchProducts();
    this.searchTextChanged
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.fetchProducts();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchProducts() {
    this.productService
      .getProducts({
        page: this.page,
        limit: this.pageSize,
        keyword: this.searchText,
      })
      .subscribe({
        next: (res) => {
          this.items = res.data;
          this.totalItems = res?.meta?.pagination?.totalItems ?? 0;
        },
        error: (err) => console.error('Lỗi khi lấy dữ liệu', err),
      });
  }

  onSearchChange() {
    this.searchTextChanged.next(this.searchText);
  }

  pageChanged(event: any) {
    this.page = event.page;
    this.fetchProducts();
  }

  onPageSizeChange() {
    this.page = 1;
    this.fetchProducts();
  }

  openAddProductModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template);
  }

  onProductAdded() {
    this.fetchProducts();
    this.modalRef?.hide();
  }

  openUpdateProductModal(template: TemplateRef<any>, item: any) {
    this.selectedProduct = item;
    this.modalRef = this.modalService.show(template);
  }

  onProductUpdated() {
    this.fetchProducts();
    this.modalRef?.hide();
  }

  openDeleteModal(template: TemplateRef<any>, item: any) {
    this.selectedProduct = item;
    this.modalRef = this.modalService.show(template);
  }

  cancelDeleteProduct() {
    this.modalRef?.hide();
  }

  confirmDeleteProduct() {
    this.productService.deleteProduct(this.selectedProduct.id).subscribe({
      next: (res) => {
        if (res.statusText === 'ERROR') {
          this.modalRef?.hide();
          this.toastr.error(`Lỗi: ${res.message}`);
        } else {
          this.fetchProducts();
          this.modalRef?.hide();
          this.toastr.success('Xóa sản phẩm thành công!');
        }
      },
      error: (err) => {
        this.modalRef?.hide();
        this.toastr.error(`Xóa sản phẩm thất bại: ${err.error.message}`);
      },
    });
  }
}
