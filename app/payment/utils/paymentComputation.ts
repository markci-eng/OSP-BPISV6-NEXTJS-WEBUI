export type PaymentComputation = {
  comCBI: number;
  ncomCBI: number;
  commission: number;
  transportationExpense: number;

  vatableSales: number;
  totalSales: number;
  vat: number;

  vatExemptSales: number;
  lessVat: number;
  subTotal: number;

  zeroRatedSales: number;
  amountNetOfVat: number;
  withholdingTax: number;

  vatAmount: number;
  amountDue: number;
  totalAmountDue: number;
};

const VAT_RATE = 0.12;

/**
 * Per-planholder payment computation.
 *
 * Values are derived from the currently selected planholder only, so they do
 * not accumulate as more payments are added to the list. The installment
 * amount is treated as the VAT-inclusive total, hence Total Amount Due equals
 * the installment amount.
 */
export function computePayments(
  amount = 0,
  commission = 0,
  transportationExpense = 0,
): PaymentComputation {
  const totalSales = amount;

  const vatableSales = amount / (1 + VAT_RATE);
  const vat = vatableSales * VAT_RATE;

  const vatExemptSales = 0;
  const zeroRatedSales = 0;

  const lessVat = vat;
  const subTotal = vatableSales;
  const amountNetOfVat = vatableSales;

  const withholdingTax = commission * 0.02;

  // Commission and transportation expense are deducted from the installment
  // (VAT-inclusive) amount to arrive at the net amount due.
  const amountDue = amount - commission - transportationExpense;
  const totalAmountDue = amountDue;

  return {
    comCBI: commission,
    ncomCBI: commission * 0.5,
    commission,
    transportationExpense,

    vatableSales,
    totalSales,
    vat,

    vatExemptSales,
    lessVat,
    subTotal,

    zeroRatedSales,
    amountNetOfVat,
    withholdingTax,

    vatAmount: vat,
    amountDue,
    totalAmountDue,
  };
}
