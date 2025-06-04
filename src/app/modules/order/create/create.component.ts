import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OrderService } from '../order.service';
import { Router, RouterLink } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    NgSelectModule,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent {
  constructor(
    private orderService: OrderService,
    private router: Router,
    private fb: FormBuilder
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

  ngOnInit() {
    this.fetchProducts();
    this.addProduct();
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

  addProduct(productId = '', count = 1) {
    this.productsArray.push(this.createProductGroup(productId, count));
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
    if (this.orderForm.invalid) return;

    const formValue = this.orderForm.getRawValue();
    const formData = {
      name: formValue.name,
      phoneNumber: formValue.phoneNumber,
      email: formValue.email,
      products: formValue.products,
      totalAmount: formValue.totalAmount,
    };

    this.orderService.createOrder(formData).subscribe({
      next: () => {
        console.log('Đặt hàng thành công');
        this.router.navigate(['/order']);
      },
      error: (err) => {
        console.error('Lỗi khi đặt hàng', err);
      },
    });
  }

  fetchProducts() {
    this.orderService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => console.error('Lỗi khi lấy dữ liệu', err),
    });
  }
}
