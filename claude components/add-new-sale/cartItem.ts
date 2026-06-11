export interface CartItem {
  planDesc: string;
  mode: string;
  planTerm: string;
  quantity: number;
  price: number;
  total: number;
  contractPrice: number;
  ipInstAmt?: number;
  balance?: number;
}