export class ProductItem {
  productId!: string;
  count!: number;
}
export class Order {
  _id!: string;
  name!: string;
  phoneNumber!: string;
  email!: string;
  products!: ProductItem[];
  totalAmount!: number;
}
