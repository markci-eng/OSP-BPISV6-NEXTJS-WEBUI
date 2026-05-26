
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

export interface TblPerson {
    PersonID: string;
    EntityType: string;
    LastName: string;
    FirstName: string;
    MiddleName?: string;
    Suffix?: string;
    DateOfBirth: Date;
    PlaceOfBirth: string;
    Title?: string;
    AuditUser: string;
    AuditDate: Date;
    EditUser: string;
    EditDate: Date;
}

export interface TblOrgSetup {
    MemberID: string;
    TrxMonth: string;
    SuperiorID: string;
    PositionCode: string;
    RecruitedID?: string;
    AuditUser: string;
    AuditDate: Date;
    EditUser: string;
    EditDate: Date;
}

export interface SaleForceDetail {
    SaleForce: TblSaleForce;
    Person: TblPerson;
    OrgSetup: TblOrgSetup;
    Superior?: SaleForceDetail;
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
        DateOfBirth: new Date("1998-10-19"),
        EditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        AuditUser: "MAIN OJIMWELLLO",
        EntityType: "EMPLOYEE",
        PlaceOfBirth: "LOPEZ, QUEZON",
        Title: "MR."
    },
    {
        PersonID: "PERSONID100001",
        FirstName: "ALVIN",
        MiddleName: "MANUZON",
        LastName: "SEVILLA",
        Suffix: "JR.",
        DateOfBirth: new Date("2000-09-09"),
        EditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        AuditUser: "MAIN OJIMWELLLO",
        EntityType: "EMPLOYEE",
        PlaceOfBirth: "ANTIPOLO, RIZAL",
        Title: "MR."
    },
    {
        PersonID: "PERSONID100002",
        FirstName: "MARCUS",
        MiddleName: "",
        LastName: "SENSANO",
        DateOfBirth: new Date("2001-11-20"),
        EditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        AuditUser: "MAIN OJIMWELLLO",
        EntityType: "EMPLOYEE",
        PlaceOfBirth: "SAN MIGUEL, BULACAN",
        Title: "MR."
    },
    {
        PersonID: "PERSONID100003",
        FirstName: "GLENDA",
        MiddleName: "MANANSALA",
        LastName: "UMALI",
        DateOfBirth: new Date("1999-01-28"),
        EditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        AuditUser: "MAIN OJIMWELLLO",
        EntityType: "EMPLOYEE",
        PlaceOfBirth: "MARIKINA, METRO MANILA",
        Title: "MS."
    },
    {
        PersonID: "PERSONID100004",
        FirstName: "GRACIELA",
        MiddleName: "ENDOZO",
        LastName: "CLAVERIA",
        DateOfBirth: new Date("1998-10-19"),
        EditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        AuditUser: "MAIN OJIMWELLLO",
        EntityType: "EMPLOYEE",
        PlaceOfBirth: "MARIKINA, METRO MANILA",
        Title: "MS."
    },
    {
        PersonID: "PERSONID100005",
        FirstName: "PRISCILLA",
        MiddleName: "",
        LastName: "DE GUZMAN",
        DateOfBirth: new Date("1998-10-19"),
        EditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        AuditUser: "MAIN OJIMWELLLO",
        EntityType: "EMPLOYEE",
        PlaceOfBirth: "MARIKINA, METRO MANILA",
        Title: "MS."
    },
    {
        PersonID: "PERSONID100006",
        FirstName: "SOFIA",
        MiddleName: "BORJA",
        LastName: "JIMENO",
        DateOfBirth: new Date("1998-10-19"),
        EditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        AuditUser: "MAIN OJIMWELLLO",
        EntityType: "EMPLOYEE",
        PlaceOfBirth: "MARIKINA, METRO MANILA",
        Title: "MS."
    },
    {
        PersonID: "PERSONID100007",
        FirstName: "SOLEDAD",
        MiddleName: "",
        LastName: "URSUA",
        DateOfBirth: new Date("1998-10-19"),
        EditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        AuditUser: "MAIN OJIMWELLLO",
        EntityType: "EMPLOYEE",
        PlaceOfBirth: "MARIKINA, METRO MANILA",
        Title: "MS."
    }
]

export const OrgSetupList: TblOrgSetup[] = [
    {
        MemberID: "HO26SA100001",
        TrxMonth: "FEB26",
        SuperiorID: "HO26SA100000",
        PositionCode: "SA1",
        RecruitedID: "HO26SA100000",
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        MemberID: "HO26SA100002",
        TrxMonth: "FEB26",
        SuperiorID: "HO26SA100001",
        PositionCode: "SA1",
        RecruitedID: "HO26SA100001",
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        MemberID: "HO26SA100003",
        TrxMonth: "FEB26",
        SuperiorID: "HO26SA100000",
        PositionCode: "SA1",
        RecruitedID: "HO26SA100001",
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        MemberID: "HO26SA100004",
        TrxMonth: "FEB26",
        SuperiorID: "HO26SA100000",
        PositionCode: "SA1",
        RecruitedID: "HO26SA100000",
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        MemberID: "HO26SA100006",
        TrxMonth: "FEB26",
        SuperiorID: "HO26SA100005",
        PositionCode: "SA1",
        RecruitedID: "HO26SA100000",
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        MemberID: "HO26SA100007",
        TrxMonth: "FEB26",
        SuperiorID: "HO26SA100005",
        PositionCode: "SA1",
        RecruitedID: "HO26SA100005",
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        MemberID: "HO26SA100000",
        TrxMonth: "FEB26",
        SuperiorID: "",
        PositionCode: "SA2",
        RecruitedID: "HO26SA100000",
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    },
    {
        MemberID: "HO26SA100005",
        TrxMonth: "FEB26",
        SuperiorID: "",
        PositionCode: "SA2",
        RecruitedID: "HO26SA100000",
        AuditUser: "MAIN OJIMWELLLO",
        AuditDate: new Date("2026-02-23"),
        EditUser: "MAIN OJIMWELLLO",
        EditDate: new Date("2026-02-23")
    }
]

export const SaleForceDetailList: SaleForceDetail[] = SaleForceList.map(sf => {
    const person = PersonList.find(p => p.PersonID === sf.PersonID);
    const orgSetup = OrgSetupList.find(os => os.MemberID === sf.SaleForceID);
    const superiorSaleForce = orgSetup ? SaleForceList.find(sf => sf.SaleForceID === orgSetup.SuperiorID) : undefined;
    const superiorPerson = superiorSaleForce ? PersonList.find(p => p.PersonID === superiorSaleForce.PersonID) : undefined;

    return {
        SaleForce: sf,
        Person: person!,
        OrgSetup: orgSetup,
        Superior: superiorSaleForce && superiorPerson ? {
            SaleForce: superiorSaleForce,
            Person: superiorPerson
        } : undefined
    } as SaleForceDetail;
});
