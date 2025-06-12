import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTrash, faExclamationTriangle, faTimes } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-delete-modal',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.scss',
})
export class DeleteModalComponent {
  @Input() title!: string;
  @Input() message!: string;
  @Output() cancel: EventEmitter<void> = new EventEmitter();
  @Output() confirm: EventEmitter<void> = new EventEmitter();

  faTrash = faTrash;
  faExclamationTriangle = faExclamationTriangle;
  faTimes = faTimes;

  onCancel() {
    this.cancel.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }
}
