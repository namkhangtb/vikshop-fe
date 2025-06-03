import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OrderService } from '../order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent {
  constructor(private orderService: OrderService, private router: Router) {}

  orderForm = new FormGroup({
    name: new FormControl<string>('', [Validators.required]),
    phoneNumber: new FormControl<string>('', [
      Validators.required,
      Validators.pattern(/^[0-9]{10,15}$/),
    ]),
    email: new FormControl<string>('', [Validators.required, Validators.email]),
    totalAmount: new FormControl<number>(
      { value: 0, disabled: true },
      Validators.required
    ),
  });

  products: any[] = [];
  selectedProduct: any = null;
  countProduct: number = 1;
  priceProduct: number = 0;

  ngOnInit() {
    this.orderService.getProducts().subscribe({
      next: (data) => (this.products = data),
      error: (err) => console.error('Lỗi khi lấy dữ liệu', err),
    });
  }

  onSubmit() {
    const formData = {
      name: this.orderForm.get('name')?.value,
      phoneNumber: this.orderForm.get('phoneNumber')?.value,
      email: this.orderForm.get('email')?.value,
      product: [{ productId: this.selectedProduct, count: this.countProduct }],
    };

    this.orderService.createOrder(formData).subscribe({
      next: (data) => {
        console.log('Đặt hàng thành công');
        this.router.navigate(['/order']);
      },
      error: (err) => {
        console.error('Lỗi khi đặt hàng', err);
      },
    });
  }

  onProductSelect(event: any) {
    this.selectedProduct = event.target.value;
    this.orderService.getProductByProductId(this.selectedProduct).subscribe({
      next: (data) => {
        this.priceProduct = data.price;
        this.caculatorTotalAmount();
      },
      error: (err) => {
        console.error('Lỗi khi lấy dữ liệu', err);
      },
    });
  }

  onCountChange(event: any) {
    const input = event.target as HTMLInputElement;
    this.countProduct = Number(input.value);
    this.caculatorTotalAmount();
  }

  caculatorTotalAmount() {
    if (this.priceProduct > 0 && this.countProduct > 0) {
      const total = this.priceProduct * this.countProduct;
      this.orderForm.get('totalAmount')?.setValue(total);
    } else {
      this.orderForm.get('totalAmount')?.setValue(0);
    }
  }
}
