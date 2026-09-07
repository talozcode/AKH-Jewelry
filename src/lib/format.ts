import { Product } from "./types";

const SYMBOLS: Record<Product["currency"], string> = {
  ILS: "₪",
  USD: "$",
};

export function formatPrice(product: Product) {
  return `${SYMBOLS[product.currency]}${product.price.toLocaleString("en-US")}`;
}
