import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faTrash, faTimes, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent {
  @Input() imageSource: string = '';
  @Input() imageList: string[] = [];
  @Input() showDeleteButton: boolean = false;
  @Input() isMultipleMode: boolean = false;
  @Output() onDelete = new EventEmitter<void>();

  faEye = faEye;
  faTrash = faTrash;
  faTimes = faTimes;
  faChevronLeft = faChevronLeft;
  faChevronRight = faChevronRight;

  isPreviewOpen = false;
  currentImageIndex: number = 0;

  get currentImage(): string {
    if (this.isMultipleMode && this.imageList.length > 0) {
      return this.imageList[this.currentImageIndex];
    }
    return this.imageSource;
  }

  openPreview() {
    this.isPreviewOpen = true;
  }

  closePreview() {
    this.isPreviewOpen = false;
  }

  handleDelete() {
    this.onDelete.emit();
  }

  nextImage(event: Event) {
    event.stopPropagation();
    if (this.isMultipleMode && this.imageList.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.imageList.length;
    }
  }

  previousImage(event: Event) {
    event.stopPropagation();
    if (this.isMultipleMode && this.imageList.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.imageList.length) % this.imageList.length;
    }
  }
}
