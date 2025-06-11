export class Product {
  id!: string;
  productCode?: string;
  name!: string;
  retailPrice!: number;
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
}
