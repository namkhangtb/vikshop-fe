import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { OrderService } from '../order.service';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  faBox,
  faCartShopping,
  faEnvelope,
  faMobileScreen,
  faMoneyBillWave,
  faUser,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { NgxMaskDirective } from 'ngx-mask';
import { ProductService } from '../../product/product.service';
import { ProductModule } from '../../product/product.module';
import { Product } from '../../product/types';
import { environment } from 'environments/environment';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { ImageViewerComponent } from '@shared/components';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    FontAwesomeModule,
    ToastrModule,
    NgxMaskDirective,
    ProductModule,
    ImageViewerComponent,
  ],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss',
})
export class UpdateComponent implements OnInit {
  @Input() orderId!: string;
  @Output() updated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  constructor(
    private orderService: OrderService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private productService: ProductService
  ) {}

  orderForm = this.fb.group({
    name: ['', Validators.required],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^0[0-9]{9}$/)]],
    email: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@gmail\.com$/),
      ],
    ],
    products: this.fb.array([], [Validators.required, Validators.minLength(1)]),
    totalAmount: [{ value: 0, disabled: true }, Validators.required],
  });

  id: string = '';
  products: Product[] = [];
  productMap: { [key: string]: Product } = {};
  isLoading = false;

  faCartShopping = faCartShopping;
  faUser = faUser;
  faMobileScreen = faMobileScreen;
  faEnvelope = faEnvelope;
  faBox = faBox;
  faMoneyBillWave = faMoneyBillWave;
  faXmark = faXmark;

  selectedProductControl = new FormControl(null);

  page = 1;
  pageSize = 10;
  loading = false;
  hasMore = true;
  currentSearch = '';
  private productSearchChanged = new Subject<string>();
  private destroy$ = new Subject<void>();

  urlImage: string = environment.apiUrl + '/uploads/';

  ngOnInit() {
    this.id = this.orderId || '';
    this.fetchProducts();
    this.fetchDataForm();
    this.productSearchChanged
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((keyword) => {
        this.currentSearch = keyword;
        this.page = 1;
        this.products = [];
        this.hasMore = true;
        this.fetchProducts();
      });
  }

  onSearchProduct(event: any) {
    this.productSearchChanged.next(event.term);
  }

  loadMoreProduct() {
    this.fetchProducts();
  }

  onClearProduct() {
    this.productSearchChanged.next('');
  }

  get productsArray(): FormArray {
    return this.orderForm.get('products') as FormArray;
  }

  createProductGroup(productId = '', count = 1): FormGroup {
    const group = this.fb.group({
      productId: [productId, Validators.required],
      count: [count, [Validators.required, Validators.min(1)]],
    });
    group.valueChanges.subscribe(() => this.calculateTotalAmount());
    return group;
  }

  addProduct(product: any) {
    if (!product) return;

    const existingProduct = this.productsArray.controls.find(
      (control) => control.get('productId')?.value === product.id
    );

    if (existingProduct) {
      this.toastr.warning('Sản phẩm này đã được thêm vào đơn hàng');
      return;
    }

    this.productsArray.push(this.createProductGroup(product.id, 1));
    this.selectedProductControl.reset();
    this.calculateTotalAmount();
  }

  removeProduct(index: number) {
    this.productsArray.removeAt(index);
    this.calculateTotalAmount();
  }

  calculateTotalAmount() {
    let total = 0;
    for (const group of this.productsArray.controls) {
      const { productId, count } = group.value;
      const product =
        this.productMap[productId] ||
        this.products.find((p) => p.id === productId);
      if (product) {
        total += count * product.retailPrice;
      }
    }
    this.orderForm.get('totalAmount')?.setValue(total);
  }

  onSubmit() {
    if (this.orderForm.invalid || !this.id) return;
    this.isLoading = true;
    const formValue = this.orderForm.getRawValue();
    const formData = {
      name: formValue.name,
      phoneNumber: formValue.phoneNumber,
      email: formValue.email,
      products: formValue.products,
      totalAmount: formValue.totalAmount,
    };
    this.orderService.updateOrder(formData, this.id).subscribe({
      next: (res) => {
        if (res.statusText === 'ERROR') {
          this.toastr.error(`Lỗi: ${res.message}`);
        } else {
          this.toastr.success('Cập nhật đơn hàng thành công!');
          this.updated.emit();
          this.close();
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(`Cập nhật đơn hàng thất bại: ${err.error.message}`);
        console.error('Lỗi khi cập nhật đơn hàng', err);
        this.close();
        this.isLoading = false;
      },
    });
  }

  fetchProducts() {
    if (this.loading || !this.hasMore) return;
    this.loading = true;
    this.productService
      .getProducts({
        keyword: this.currentSearch,
        page: this.page,
        limit: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          const data = Array.isArray(res.data) ? res.data : [];
          this.products = [...this.products, ...data];
          this.hasMore = data.length === this.pageSize;
          this.loading = false;
          this.page++;
        },
        error: (err) => {
          console.error('Lỗi khi lấy dữ liệu sản phẩm', err);
          this.toastr.error('Không thể tải danh sách sản phẩm');
          this.loading = false;
        },
      });
  }

  fetchDataForm() {
    if (!this.id) return;
    this.isLoading = true;
    this.orderService.getOrder(this.id).subscribe({
      next: (res: any) => {
        this.orderForm.patchValue({
          name: res.data.name,
          phoneNumber: res.data.phoneNumber,
          email: res.data.email,
          totalAmount: res.data.totalAmount,
        });

        this.productsArray.clear();
        for (let item of res.data.products) {
          this.productMap[item.productId.id] = item.productId;
          this.productsArray.push(
            this.createProductGroup(item.productId.id, item.count)
          );
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi lấy đơn hàng', err);
        this.toastr.error('Không thể tải thông tin đơn hàng');
        this.close();
        this.isLoading = false;
      },
    });
  }

  close() {
    this.closed.emit();
    this.isLoading = false;
  }

  getProductName(productId: string): string {
    console.log(this.productMap);

    if (this.productMap[productId]) {
      return this.productMap[productId].name;
    }
    const product = this.products.find((p) => p.id === productId);
    if (product) {
      this.productMap[productId] = product;
      return product.name;
    }
    return '';
  }

  getProductImage(productId: string): string | null {
    console.log(this.productMap);

    if (this.productMap[productId]) {
      return this.productMap[productId].images?.[0] ?? null;
    }
    const product = this.products.find((p) => p.id === productId);
    if (product) {
      this.productMap[productId] = product;
      return product.images?.[0] ?? null;
    }
    return null;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
