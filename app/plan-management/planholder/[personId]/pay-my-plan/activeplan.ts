export interface ActivePlan {
  contractNo: string;
  plan: string;
  mode: string;
  amountDue: string;
  effectiveDate: string;
  dueDate: string;
  balance: string;
}

export const activePlans: ActivePlan[] = [
  {
    contractNo: "L25053241I",
    plan: "ST. DOMINIQUE",
    mode: "Monthly",
    amountDue: "1,285.00",
    effectiveDate: "05/02/2025",
    dueDate: "06/02/2025",
    balance: "75,815.00",
  },
  {
    contractNo: "LOS001111C",
    plan: "ST. ANNE",
    mode: "Monthly",
    amountDue: "3,000.00",
    effectiveDate: "02/09/2026",
    dueDate: "04/09/2026",
    balance: "174,000.00",
  },
  {
    contractNo: "LOS001112C",
    plan: "ST. GREGORY",
    mode: "Annual",
    amountDue: "11,400.00",
    effectiveDate: "02/20/2026",
    dueDate: "02/20/2027",
    balance: "45,600.00",
  },
  // {
  //   contractNo: "LOS001113C",
  //   plan: "ST. CLAIRE",
  //   mode: "Annual",
  //   amountDue: "19,700.00",
  //   effectiveDate: "03/09/2026",
  //   dueDate: "03/09/2027",
  //   balance: "78,800.00",
  // },
];
