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
import { ActivatedRoute } from '@angular/router';
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
  ],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss',
})
export class UpdateComponent implements OnInit {
  @Input() orderId: string = '';
  @Output() updated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  constructor(
    private orderService: OrderService,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  orderForm = this.fb.group({
    name: ['', Validators.required],
    phoneNumber: [
      '',
      [Validators.required, Validators.pattern(/^[0-9]{10,15}$/)],
    ],
    email: ['', [Validators.required, Validators.email]],
    products: this.fb.array([]),
    totalAmount: [{ value: 0, disabled: true }, Validators.required],
  });

  products: any[] = [];
  isLoading = false;

  faCartShopping = faCartShopping;
  faUser = faUser;
  faMobileScreen = faMobileScreen;
  faEnvelope = faEnvelope;
  faBox = faBox;
  faMoneyBillWave = faMoneyBillWave;
  faXmark = faXmark;

  selectedProductControl = new FormControl(null);

  ngOnInit() {
    this.fetchProducts();
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

  addProduct() {
    const productId = this.selectedProductControl.value;
    if (productId) {
      this.productsArray.push(this.createProductGroup(productId, 1));
      this.selectedProductControl.reset();
      this.calculateTotalAmount();
    }
  }

  removeProduct(index: number) {
    this.productsArray.removeAt(index);
    this.calculateTotalAmount();
  }

  calculateTotalAmount() {
    let total = 0;
    for (const group of this.productsArray.controls) {
      const { productId, count } = group.value;
      const product = this.products.find((p) => p.productId === productId);
      if (product) {
        total += count * product.price;
      }
    }
    this.orderForm.get('totalAmount')?.setValue(total);
  }

  onSubmit() {
    if (this.orderForm.invalid || !this.orderId) return;
    this.isLoading = true;
    const formValue = this.orderForm.getRawValue();
    const formData = {
      name: formValue.name,
      phoneNumber: '0' + formValue.phoneNumber,
      email: formValue.email,
      products: formValue.products,
      totalAmount: formValue.totalAmount,
    };
    this.orderService.updateOrder(formData, this.orderId).subscribe({
      next: () => {
        this.toastr.success('Cập nhật đơn hàng thành công!');
        this.updated.emit();
        this.close();
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Cập nhật đơn hàng thất bại!');
        console.error('Lỗi khi cập nhật đơn hàng', err);
        this.close();
        this.isLoading = false;
      },
    });
  }

  fetchProducts() {
    this.orderService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.fetchDataForm();
      },
      error: (err) => console.error('Lỗi khi lấy dữ liệu', err),
    });
  }

  fetchDataForm() {
    if (!this.orderId) return;
    this.orderService.getOrder(this.orderId).subscribe({
      next: (data: any) => {
        this.orderForm.patchValue({
          name: data.name,
          phoneNumber: data.phoneNumber?.replace(/^0/, ''),
          email: data.email,
        });
        this.productsArray.clear();
        for (let item of data.products) {
          this.productsArray.push(this.createProductGroup(item.productId, item.count));
        }
        this.calculateTotalAmount();
      },
      error: (err) => console.error('Lỗi khi lấy đơn hàng', err),
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
    const product = this.products.find((p) => p.productId === productId);
    return product ? product.name : '';
  }
}
