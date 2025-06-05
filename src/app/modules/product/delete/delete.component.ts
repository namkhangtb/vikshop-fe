import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProductService } from '../product.service';

@Component({
  selector: 'app-delete',
  standalone: true,
  imports: [],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss',
})
export class DeleteComponent {
  constructor(private productService: ProductService) {}
  @Input() productIdDelete: string = '';
  @Output() closedDeleteModal = new EventEmitter<boolean>();
  @Output() deleted = new EventEmitter<boolean>();

  closeModal() {
    this.closedDeleteModal.emit(false);
  }

  confirmDelete() {
    this.productService.deleteProduct(this.productIdDelete).subscribe({
      next: () => {
        this.deleted.emit(true);
      },
      error: (err) => {
        console.error('Xóa thất bại', err);
        this.deleted.emit(false);
      },
    });
  }
}
