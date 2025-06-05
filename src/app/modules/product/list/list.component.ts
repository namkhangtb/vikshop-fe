import { Component } from '@angular/core';
import { ProductService } from '../product.service';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../types';
import { CommonModule } from '@angular/common';
import { DeleteComponent } from '../delete/delete.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, RouterLink, DeleteComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  constructor(private productService: ProductService, private router: Router) {}
  items: Product[] = [];
  isOpenDeleteModal: boolean = false;
  productIdDelete: string = '';
  urlImage: string = environment.apiUrl + '/uploads/';

  ngOnInit() {
    this.fetchProducts();
  }

  goToEditProduct(item: any) {
    this.router.navigate([`/product/update/${item._id}`]);
  }

  openDeleteModal(item: any) {
    this.isOpenDeleteModal = true;
    this.productIdDelete = item._id;
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

  fetchProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        this.items = data;
      },
      error: (err) => console.error('Lỗi khi lấy dữ liệu', err),
    });
  }
}
