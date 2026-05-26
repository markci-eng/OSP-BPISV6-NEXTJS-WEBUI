import { PaymentRecord } from "../data/payment.types";

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

export function computePayments(payments: PaymentRecord[], baseAmount = 0): PaymentComputation {
  const sum = (key: keyof PaymentRecord) =>
    payments.reduce((acc, p) => acc + Number(p[key] ?? 0), 0);

  const totalCom = sum("COMPCV");
  const net = sum("ComDue");
  const te = sum("TEPCV");

  const vatableSales = baseAmount;
  const vat = vatableSales * 0.12;

  const totalSales = vatableSales + vat;
  const vatExemptSales = 0;
  const zeroRatedSales = 0;

  const amountNetOfVat = vatableSales;
  const lessVat = vat;

  const subTotal = totalSales;
  const withholdingTax = totalCom * 0.02;

  const amountDue = subTotal - withholdingTax;
  const totalAmountDue = amountDue;

  return {
    comCBI: totalCom,
    ncomCBI: totalCom * 0.5,
    commission: totalCom,
    transportationExpense: te,

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