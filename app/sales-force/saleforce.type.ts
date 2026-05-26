
export interface TblSaleForce {
    SaleForceID: string;
    PersonID: string;
    PositionCode: string;
    IsActive: boolean;
    AuditUser: string;
    AuditDate: Date;
    IsReported: boolean;
    EditUser: string;
    EditDate: Date;
}

export interface TblOrgSetup {
    MemberID: string;
    TrxMonth: string;
    SuperiorID: string;
    PositionCode: string;
    RecruitedID: string;
    AuditUser: string;
    AuditDate: Date;
    EditUser: string;
    EditDate: Date;
}

export interface TblPerson {
    PersonID: string;
    FirstName: string;
    LastName: string;
    MiddleName?: string;
    BirthDate: Date;
}


export const SaleForceList: TblSaleForce[] = [
    {
        SaleForceID: "HO26SA100000",
        PersonID: "PERSONID100000",
        PositionCode: "SA2",
        IsActive: true,
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        IsReported: true,
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        SaleForceID: "HO26SA100001",
        PersonID: "PERSONID100001",
        PositionCode: "SA1",
        IsActive: true,
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        IsReported: true,
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        SaleForceID: "HO26SA100003",
        PersonID: "PERSONID100003",
        PositionCode: "SA1",
        IsActive: true,
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        IsReported: true,
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        SaleForceID: "HO26SA100004",
        PersonID: "PERSONID100004",
        PositionCode: "SA1",
        IsActive: true,
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        IsReported: true,
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        SaleForceID: "HO26SA100005",
        PersonID: "PERSONID100005",
        PositionCode: "SA2",
        IsActive: true,
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        IsReported: true,
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        SaleForceID: "HO26SA100006",
        PersonID: "PERSONID100006",
        PositionCode: "SA1",
        IsActive: true,
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        IsReported: true,
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        SaleForceID: "HO26SA100007",
        PersonID: "PERSONID100007",
        PositionCode: "SA1",
        IsActive: true,
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        IsReported: true,
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    }
]

export const PersonList: TblPerson[] = [
    {
        PersonID: "PERSONID100000",
        FirstName: "JIMWELL",
        MiddleName: "LEONOR",
        LastName: "OCSIO",
        BirthDate: new Date("1998-10-19")
    },
    {
        PersonID: "PERSONID100001",
        FirstName: "ALVIN",
        MiddleName: "MANUZON",
        LastName: "SEVILLA",
        BirthDate: new Date("2000-09-09")
    },
    {
        PersonID: "PERSONID100002",
        FirstName: "MARCUS",
        MiddleName: "",
        LastName: "SENSANO",
        BirthDate: new Date("1998-10-19")
    },
    {
        PersonID: "PERSONID100003",
        FirstName: "GLENDA",
        MiddleName: "MANANSALA",
        LastName: "UMALI",
        BirthDate: new Date("1999-01-28")
    },
    {
        PersonID: "PERSONID100004",
        FirstName: "GRACIELA",
        MiddleName: "ENDOZO",
        LastName: "CLAVERIA",
        BirthDate: new Date("1998-10-19")
    },
    {
        PersonID: "PERSONID100005",
        FirstName: "PRISCILLA",
        MiddleName: "",
        LastName: "DE GUZMAN",
        BirthDate: new Date("1998-10-19")
    },
    {
        PersonID: "PERSONID100006",
        FirstName: "SOFIA",
        MiddleName: "BORJA",
        LastName: "JIMENO",
        BirthDate: new Date("1998-10-19")
    },
    {
        PersonID: "PERSONID100007",
        FirstName: "SOLEDAD",
        MiddleName: "",
        LastName: "URSUA",
        BirthDate: new Date("1998-10-19")
    }
]

export const OrgSetupList: TblOrgSetup[] = [
    {
        MemberID: "PERSONID100001",
        TrxMonth: "FEB26",
        SuperiorID: "PERSONID100000",
        PositionCode: "SA1",
        RecruitedID: "PERSONID100000",
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        MemberID: "PERSONID100002",
        TrxMonth: "FEB26",
        SuperiorID: "PERSONID100000",
        PositionCode: "SA1",
        RecruitedID: "PERSONID100000",
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        MemberID: "PERSONID100003",
        TrxMonth: "FEB26",
        SuperiorID: "PERSONID100000",
        PositionCode: "SA1",
        RecruitedID: "PERSONID100001",
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        MemberID: "PERSONID100004",
        TrxMonth: "FEB26",
        SuperiorID: "PERSONID100000",
        PositionCode: "SA1",
        RecruitedID: "PERSONID100000",
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        MemberID: "PERSONID100006",
        TrxMonth: "FEB26",
        SuperiorID: "PERSONID100005",
        PositionCode: "SA1",
        RecruitedID: "PERSONID100000",
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        MemberID: "PERSONID100007",
        TrxMonth: "FEB26",
        SuperiorID: "PERSONID100005",
        PositionCode: "SA1",
        RecruitedID: "PERSONID100000",
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        MemberID: "PERSONID100000",
        TrxMonth: "FEB26",
        SuperiorID: "",
        PositionCode: "SA2",
        RecruitedID: "PERSONID100000",
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        MemberID: "PERSONID100005",
        TrxMonth: "FEB26",
        SuperiorID: "",
        PositionCode: "SA2",
        RecruitedID: "PERSONID100000",
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    }
]

export interface Node {
    id: string
  name: string
  children?: Node[]
}

export function getSaleForceTreeData(): Node[] {
    const sa2List = SaleForceList.filter(sf => sf.PositionCode === "SA2");

    const treeData: Node[] = sa2List.map(sa2 => {
        const sa2Person = PersonList.find(p => p.PersonID === sa2.PersonID);

        const children: Node[] = OrgSetupList
            .filter(os => os.SuperiorID === sa2.PersonID)
            .map(os => {
                const person = PersonList.find(p => p.PersonID === os.MemberID);

                return {
                    id: os.MemberID,
                    name: `${person?.FirstName ?? ""} ${person?.LastName ?? ""} - ${os.PositionCode}`.trim(),
                    children: []
                };
            });

        return {
            id: sa2.PersonID,
            name: `${sa2Person?.FirstName ?? ""} ${sa2Person?.LastName ?? ""} - ${OrgSetupList.find(x => x.MemberID === sa2.PersonID)?.PositionCode}`.trim(),
            children
        };
    });

    return treeData;
}