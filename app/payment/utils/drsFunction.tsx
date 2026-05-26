import { useMemo } from "react";
import { DrsRowData, DrsTotals, PaymentRecord } from "../data/payment.types";

export function DrsFunction(payments: PaymentRecord[]) {
  // Convert payments → rows
  const rows: DrsRowData[] = useMemo(() => {
    return payments.map((p) => ({
      LPANo: p.LPANo,
      name: p.name,
      InstNo: p.InstNo.toString(),
      SIDate: p.SIDate,
      SI: p.SI.toString(),
      PayClass: p.PayClass,
      remarks: "-",
      aging: "-",
      GrossCom: Number(p.GrossCom || 0),
      ncom: Number(p.TaxCom || 0),
      others: 0,
      ComDue: Number(p.ComDue || 0),
      TEPCV: Number(p.TEPCV || 0),
      COMPCV: Number(p.COMPCV || 0),
      net:
        Number(p.GrossCom || 0) -
        (Number(p.TEPCV || 0) + Number(p.COMPCV || 0)),
    }));
  }, [payments]);

  // Compute totals
  const totals: DrsTotals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.GrossCom += r.GrossCom ?? 0;
        acc.ncom += r.ncom ?? 0;
        acc.others += r.others ?? 0;
        acc.ComDue += r.ComDue ?? 0;
        acc.TEPCV += r.TEPCV ?? 0;
        acc.COMPCV += r.COMPCV ?? 0;
        acc.net += r.net ?? 0;
        return acc;
      },
      {
        GrossCom: 0,
        ncom: 0,
        others: 0,
        ComDue: 0,
        TEPCV: 0,
        COMPCV: 0,
        net: 0,
      },
    );
  }, [rows]);

  return { rows, totals };
}
