import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../product.service';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import { UploadModule } from '../../upload/upload.module';
import { UploadService } from '../../upload/upload.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [
    NgxMaskDirective,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UploadModule,
  ],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss',
})
export class UpdateComponent {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private uploadService: UploadService
  ) {}

  _id: string = '';
  urlImage: string = environment.apiUrl;

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

  ngOnInit(): void {
    this._id = this.route.snapshot.paramMap.get('id') || '';
    this.fetchDataForm();
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.productService
        .updateProduct(this.productForm.value, this._id)
        .subscribe(() => {
          this.router.navigate(['/product']);
        });
    }
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

  goToProductList(): void {
    this.router.navigate(['/product']);
  }

  fetchDataForm() {
    if (this._id) {
      this.productService.getProduct(this._id).subscribe({
        next: (data) => {
          this.productForm.patchValue({
            name: data.name,
            productId: data.productId,
            barcode: data.barcode,
            weight: data.weight,
            shortDescription: data.shortDescription,
            retailPrice: data.retailPrice,
            importPrice: data.importPrice,
            wholesalePrice: data.wholesalePrice,
            livestreamPrice: data.livestreamPrice,
            marketPrice: data.marketPrice,
            upsalePrice: data.upsalePrice,
            images: data.images || [],
          });
        },
        error: (err) => console.error('Lỗi khi lấy sản phẩm', err),
      });
    }
  }
}
