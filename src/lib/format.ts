import { Product } from "./types";

const SYMBOLS: Record<Product["currency"], string> = {
  ILS: "₪",
  USD: "$",
};

export function formatPrice(product: Product) {
  return `${SYMBOLS[product.currency]}${product.price.toLocaleString("en-US")}`;
}

/** For an amount already in Stripe's smallest-currency-unit integer form
 *  (orders.amount_total etc.), not a Product's own major-unit price -
 *  used by order emails, the CSV export, and admin order displays, which
 *  all read amounts off `orders`/`order_items` rather than a live product. */
export function formatMoney(amountInSmallestUnit: number, currency: string): string {
  const symbol = currency === "ILS" ? "₪" : currency === "USD" ? "$" : currency + " ";
  return `${symbol}${(amountInSmallestUnit / 100).toLocaleString("en-US")}`;
}
