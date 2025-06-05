import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { UploadModule } from '../../upload/upload.module';
import { UploadService } from '../../upload/upload.service';
import { ProductService } from '../product.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    NgxMaskDirective,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UploadModule,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
  providers: [provideNgxMask()],
})
export class CreateComponent {
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private uploadService: UploadService,
    private router: Router
  ) {}

  productForm = this.fb.group({
    productId: [''],
    name: ['', Validators.required],
    retailPrice: [0, [Validators.min(0)]],
    importPrice: [0, [Validators.min(0)]],
    wholesalePrice: [0, [Validators.min(0)]],
    livestreamPrice: [0, [Validators.min(0)]],
    marketPrice: [0, [Validators.min(0)]],
    upsalePrice: [0, [Validators.min(0)]],
    barcode: [''],
    weight: [0, [Validators.min(0)]],
    shortDescription: [''],
    images: [[] as Array<string>, Validators.maxLength(9)],
    stock: [0, [Validators.min(0)]],
  });

  urlImage: string = environment.apiUrl + '/uploads/';

  goToProductList() {
    this.router.navigate(['/product']);
  }

  onImageSelected(event: any) {
    const files: FileList = event.target.files;

    const currentImages: string[] = this.productForm.get('images')?.value || [];

    if (currentImages.length + files.length > 9) {
      alert('Chỉ được tải lên tối đa 9 ảnh');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.uploadService.uploadFile(file).subscribe({
        next: (url: string) => {
          const updatedImages = [
            ...(this.productForm.get('images')?.value || []),
            url,
          ];
          this.productForm.get('images')?.setValue(updatedImages);
        },
        error: (err) => {
          console.error('Lỗi upload ảnh:', err);
          alert('Upload ảnh thất bại');
        },
      });
    }
  }

  removeImage(index: number) {
    const images = [...(this.productForm.get('images')?.value || [])];
    const imageUrl = images[index];
    const filename = imageUrl.split('/').pop();
    if (!filename) {
      console.error('Không tìm thấy tên file từ URL', imageUrl);
      return;
    }
    this.uploadService.deleteFile(filename).subscribe({
      next: () => {
        images.splice(index, 1);
        this.productForm.get('images')?.setValue(images);
      },
      error: (err) => {
        console.error('Lỗi xóa ảnh:', err);
        alert('Không thể xóa ảnh');
      },
    });
  }

  onSubmit() {
    if (this.productForm.invalid) {
      alert('Form chưa hợp lệ');
      return;
    }

    this.productService.createProduct(this.productForm.value).subscribe({
      next: () => {
        console.log('Tạo sản phẩm thành công');
        this.router.navigate(['/product']);
      },
      error: (err) => {
        console.error('Tạo thất bại', err);
        alert('Tạo sản phẩm thất bại');
      },
    });
  }
}
