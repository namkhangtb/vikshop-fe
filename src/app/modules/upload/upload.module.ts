import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadService } from './upload.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [],
  imports: [CommonModule, HttpClientModule],
  providers: [UploadService],
})
export class UploadModule {}
