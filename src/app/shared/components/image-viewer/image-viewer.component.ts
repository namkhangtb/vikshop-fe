import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './image-viewer.component.html',
  styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent {
  @Input() imageSource: string = '';
  @Input() showDeleteButton: boolean = false;
  @Output() onDelete = new EventEmitter<void>();

  faEye = faEye;
  faTrash = faTrash;
  faTimes = faTimes;

  isPreviewOpen = false;

  openPreview() {
    this.isPreviewOpen = true;
  }

  closePreview() {
    this.isPreviewOpen = false;
  }

  handleDelete() {
    this.onDelete.emit();
  }
}
