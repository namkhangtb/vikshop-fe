import { Product } from '../product/types';

export class ProductItem {
  productId!: Product;
  count!: number;
}
export class Order {
  id!: string;
  name!: string;
  phoneNumber!: string;
  email!: string;
  products!: ProductItem[];
  totalAmount!: number;
}
