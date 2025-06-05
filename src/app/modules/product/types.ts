export class Product {
  productId?: string;
  name!: string;
  retailPrice?: number;
  importPrice?: number;
  wholesalePrice?: number;
  livestreamPrice?: number;
  marketPrice?: number;
  upsalePrice?: number;
  barcode?: string;
  weight?: number;
  shortDescription?: string;
  images?: string[];
  stock?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
