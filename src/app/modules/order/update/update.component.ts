import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { OrderService } from '../order.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss',
})
export class UpdateComponent {
  constructor(
    private orderService: OrderService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

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

  orderId: string = '';
  products: any[] = [];
  selectedProduct: any = null;
  countProduct: number = 1;
  priceProduct: number = 0;

  ngOnInit() {
    this.orderId = this.activatedRoute.snapshot.params['id'];
    this.fetchProducts();
    this.fetchDataForm();
  }

  onSubmit() {
    const formData = {
      name: this.orderForm.get('name')?.value,
      phoneNumber: this.orderForm.get('phoneNumber')?.value,
      email: this.orderForm.get('email')?.value,
      product: [{ productId: this.selectedProduct, count: this.countProduct }],
    };

    this.orderService.updateOrder(formData, this.orderId).subscribe({
      next: (data) => {
        console.log('cập nhật hàng thành công');
        this.router.navigate(['/order']);
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật hàng', err);
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

  fetchProducts() {
    this.orderService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => console.error('Lỗi khi lấy dữ liệu', err),
    });
  }

  fetchDataForm() {
    this.orderService.getOrder(this.orderId).subscribe({
      next: (data: any) => {
      this.orderForm.get('name')?.setValue(data.name);
      this.orderForm.get('phoneNumber')?.setValue(data.phoneNumber);
      this.orderForm.get('email')?.setValue(data.email);
      this.orderForm.get('totalAmount')?.setValue(data.totalAmount);
      this.selectedProduct = data.products[0].productId;
      }
    });
  }
}
