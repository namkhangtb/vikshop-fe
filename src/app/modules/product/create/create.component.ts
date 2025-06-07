import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { UploadModule } from '../../upload/upload.module';
import { UploadService } from '../../upload/upload.service';
import { ProductService } from '../product.service';
import { environment } from '../../../../environments/environment';
import { faBox, faFileImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    NgxMaskDirective,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UploadModule,
    FontAwesomeModule,
    NgxMaskDirective,
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
  providers: [provideNgxMask()],
})
export class CreateComponent {
  @Input() productId: string = '';
  @Output() added = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  faBox = faBox;
  faFileImage = faFileImage;

  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private uploadService: UploadService,
    private toastr: ToastrService
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

  onImageSelected(event: any) {
    const files: FileList = event.target.files;
    const currentImages: string[] = this.productForm.get('images')?.value || [];
    if (currentImages.length + files.length > 9) {
      this.toastr.error('Chỉ được tải lên tối đa 9 ảnh');
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
          this.toastr.success('Upload ảnh thành công');
        },
        error: (err) => {
          console.error('Lỗi upload ảnh:', err);
          this.toastr.error('Upload ảnh thất bại');
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
      this.toastr.error('Không tìm thấy tên file từ URL');
      return;
    }
    this.uploadService.deleteFile(filename).subscribe({
      next: () => {
        images.splice(index, 1);
        this.productForm.get('images')?.setValue(images);
        this.toastr.success('Xóa ảnh thành công');
      },
      error: (err) => {
        console.error('Lỗi xóa ảnh:', err);
        this.toastr.error('Không thể xóa ảnh');
      },
    });
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.toastr.error('Form chưa hợp lệ');
      return;
    }
    this.isLoading = true;
    this.productService.createProduct(this.productForm.value).subscribe({
      next: () => {
        this.toastr.success('Tạo sản phẩm thành công');
        this.added.emit();
        this.close();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Tạo thất bại', err);
        this.toastr.error('Tạo sản phẩm thất bại');
        this.close();
        this.isLoading = false;
      },
    });
  }

  close() {
    this.closed.emit();
    this.productForm.reset();
    this.isLoading = false;
  }
}
