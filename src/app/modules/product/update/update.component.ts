import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProductService } from '../product.service';
import { CommonModule } from '@angular/common';
import { UploadModule } from '../../upload/upload.module';
import { UploadService } from '../../upload/upload.service';
import { environment } from '../../../../environments/environment';
import { faBox, faFileImage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxMaskDirective } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    UploadModule,
    FontAwesomeModule,
    NgxMaskDirective,
  ],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss',
})
export class UpdateComponent {
  @Input() productId!: string;
  @Output() updated = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private uploadService: UploadService,
    private toastr: ToastrService
  ) {}

  id: string = '';
  urlImage: string = environment.apiUrl + '/uploads/';
  isLoading = false;

  productForm = this.fb.group({
    productCode: [''],
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

  faBox = faBox;
  faFileImage = faFileImage;

  ngOnInit(): void {
    this.id = this.productId || '';
    this.fetchDataForm();
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.isLoading = true;
      this.productService
        .updateProduct(this.productForm.value, this.id)
        .subscribe({
          next: (res) => {
            if (res.statusText == 'ERROR') {
              this.toastr.error(`Lỗi: ${res.message}`);
              this.isLoading = false;
            } else {
              this.isLoading = false;
              this.updated.emit();
              this.toastr.success('Cập nhật sản phẩm thành công');
            }
          },
          error: () => {
            this.isLoading = false;
            this.toastr.error('Cập nhật sản phẩm thất bại');
          },
        });
    }
  }

  onImageSelected(event: any) {
    const files: FileList = event.target.files;

    const currentImages: string[] = this.productForm.get('images')?.value || [];

    if (currentImages.length + files.length > 9) {
      this.toastr.error('Chỉ được tải lên 9 ảnh');
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

  fetchDataForm() {
    if (this.id) {
      this.isLoading = true;
      this.productService.getProduct(this.id).subscribe({
        next: (res) => {
          this.productForm.patchValue({
            name: res.data.name,
            productCode: res.data.productCode,
            barcode: res.data.barcode,
            weight: res.data.weight,
            shortDescription: res.data.shortDescription,
            retailPrice: res.data.retailPrice,
            importPrice: res.data.importPrice,
            wholesalePrice: res.data.wholesalePrice,
            livestreamPrice: res.data.livestreamPrice,
            marketPrice: res.data.marketPrice,
            upsalePrice: res.data.upsalePrice,
            images: res.data.images || [],
          });
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Lỗi khi lấy sản phẩm', err);
        },
      });
    }
  }

  close(): void {
    this.closed.emit();
    this.isLoading = false;
  }
}
