import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OrderService } from '../order.service';
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
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { FormControl } from '@angular/forms';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ProductModule } from '../../product/product.module';
import { ProductService } from '../../product/product.service';
import { environment } from 'environments/environment';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { ImageViewerComponent } from '@shared/components';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgSelectModule,
    FontAwesomeModule,
    NgxMaskDirective,
    ToastrModule,
    ProductModule,
    ImageViewerComponent,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
  providers: [provideNgxMask()],
})
export class CreateComponent {
  @Output() added = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
    private fb: FormBuilder,
    private toastr: ToastrService
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
    products: this.fb.array([], Validators.minLength(1)),
    totalAmount: [{ value: 0, disabled: true }, Validators.required],
  });

  products: any[] = [];

  faCartShopping = faCartShopping;
  faUser = faUser;
  faMobileScreen = faMobileScreen;
  faEnvelope = faEnvelope;
  faBox = faBox;
  faMoneyBillWave = faMoneyBillWave;
  faXmark = faXmark;

  selectedProductControl = new FormControl(null);
  isLoading = false;

  page = 1;
  pageSize = 10;
  loading = false;
  hasMore = true;
  currentSearch = '';
  private productSearchChanged = new Subject<string>();
  private destroy$ = new Subject<void>();

  urlImage: string = environment.apiUrl + '/uploads/';

  ngOnInit() {
    this.fetchProducts();
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
      const product = this.products.find((p) => p.id === productId);
      if (product) {
        total += count * product.retailPrice;
      }
    }
    this.orderForm.get('totalAmount')?.setValue(total);
  }

  onSubmit() {
    if (this.orderForm.invalid) return;
    this.isLoading = true;
    const formValue = this.orderForm.getRawValue();
    const formData = {
      name: formValue.name,
      phoneNumber: formValue.phoneNumber,
      email: formValue.email,
      products: formValue.products,
      totalAmount: formValue.totalAmount,
    };
    this.orderService.createOrder(formData).subscribe({
      next: (res) => {
        if (res.statusText === 'ERROR') {
          this.toastr.error(`Lỗi: ${res.message}`);
        } else {
          this.toastr.success('Tạo đơn hàng thành công!');
          this.added.emit();
          this.close();
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error(`Tạo đơn hàng thất bại: ${err.error.message}`);
        console.error('Lỗi khi đặt hàng', err);
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

  close() {
    this.closed.emit();
    this.orderForm.reset();
    while (this.productsArray.length > 0) {
      this.productsArray.removeAt(0);
    }
    this.isLoading = false;
  }

  getProductName(productId: string): string {
    const product = this.products.find((p) => p.id === productId);
    return product ? product.name : '';
  }

  getProductImageUrls(productId: string): string[] {
    const product = this.products.find((p) => p.id === productId);
    const images = product?.images;

    return images && images.length
      ? images.map((img: string) => this.urlImage + img)
      : ['./assets/images/no-image.png'];
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
