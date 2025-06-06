import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductRoutingModule } from './product-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { ProductService } from './product.service';
import { ModalModule } from 'ngx-bootstrap/modal';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ProductRoutingModule,
    HttpClientModule,
    ModalModule.forRoot(),
  ],
  providers: [ProductService],
})
export class ProductModule {}
