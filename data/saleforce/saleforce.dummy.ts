export interface Saleforce {
    id: string;
    personId: string;
    position: string;
    superiorId: string | null;
    hiredDate: Date;
}

export interface Person {
    id: string;
    lastName: string;
    firstName: string;
    middleName?: string | null;
    suffix?: string | null;
    birthDate: Date;
    gender: string;
}

export function getSuperior(agent: Saleforce, allAgents: Saleforce[]) : Saleforce | undefined {
    return allAgents.find((e) => e.id === agent.superiorId);
}

export function getSubordinate(agent: Saleforce, allAgents: Saleforce[]) : Saleforce[] {
    return allAgents.filter((e) => e.superiorId === agent.id);
}

export function getPerson(agent: Saleforce, allPerson: Person[]) : Person | undefined {
    return allPerson.find((e) => e.id === agent.personId);
}

export function getPersonFullName(agent: Saleforce, allPerson: Person[]) : string | undefined {
    var person = allPerson.find((e) => e.id === agent.personId);
    if(person == undefined)
        return undefined;

    var result = person.lastName + ", " + person.firstName;
    return result;
}

export const saleforceList: Saleforce[] = [
    { id: "1", personId: "1", position: "SA2", superiorId: "", hiredDate: new Date("2025-02-20") },
    { id: "2", personId: "2", position: "SA1", superiorId: "1", hiredDate: new Date("2025-03-01") },
    { id: "3", personId: "3", position: "SA1", superiorId: "1", hiredDate: new Date("2025-03-14") },
    { id: "4", personId: "4", position: "SA1", superiorId: "1", hiredDate: new Date("2025-03-14") },
    { id: "5", personId: "5", position: "SA1", superiorId: "1", hiredDate: new Date("2025-04-21") },
    { id: "6", personId: "6", position: "SA1", superiorId: "1", hiredDate: new Date("2025-04-22") },
    { id: "7", personId: "7", position: "SA2", superiorId: "", hiredDate: new Date("2025-02-22") },
    { id: "8", personId: "8", position: "SA1", superiorId: "7", hiredDate: new Date("2025-02-23") },
    { id: "9", personId: "9", position: "SA1", superiorId: "7", hiredDate: new Date("2025-04-01") },
    { id: "10", personId: "10", position: "SA1", superiorId: "7", hiredDate: new Date("2025-04-01") },
    { id: "11", personId: "11", position: "SA1", superiorId: "7", hiredDate: new Date("2025-04-02") },
    { id: "12", personId: "12", position: "SA1", superiorId: "7", hiredDate: new Date("2025-04-10") },
    { id: "13", personId: "13", position: "SA2", superiorId: "", hiredDate: new Date("2025-02-21") },
    { id: "14", personId: "14", position: "SA1", superiorId: "13", hiredDate: new Date("2025-03-10") },
    { id: "15", personId: "15", position: "SA1", superiorId: "13", hiredDate: new Date("2025-03-11") },
    { id: "16", personId: "16", position: "SA2", superiorId: "", hiredDate: new Date("2025-03-12") },
    { id: "17", personId: "17", position: "SA1", superiorId: "16", hiredDate: new Date("2025-03-14") },
    { id: "18", personId: "18", position: "SA2", superiorId: "", hiredDate: new Date("2025-04-22") },
    { id: "19", personId: "19", position: "SA1", superiorId: "18", hiredDate: new Date("2025-06-22") },
    { id: "20", personId: "20", position: "SA1", superiorId: "18", hiredDate: new Date("2025-07-22") },
    { id: "21", personId: "21", position: "SA2", superiorId: "", hiredDate: new Date("2025-07-22") },
    { id: "22", personId: "22", position: "SA1", superiorId: "21", hiredDate: new Date("2025-05-22") },
    { id: "23", personId: "23", position: "SA2", superiorId: "", hiredDate: new Date("2025-06-22") },
    { id: "24", personId: "24", position: "SA1", superiorId: "23", hiredDate: new Date("2025-06-22") },
    { id: "25", personId: "25", position: "SA2", superiorId: "", hiredDate: new Date("2025-07-22") }
];

export const personList: Person[] = [
    { id: "1", lastName: "SANTOS", firstName: "MARIA", middleName: "LOPEZ", gender: "FEMALE", birthDate: new Date("1992-04-15") },
    { id: "2", lastName: "CRUZ", firstName: "JUAN", middleName: "DELA ROSA", suffix: "JR.", gender: "MALE", birthDate: new Date("1988-11-03") },
    { id: "3", lastName: "REYES", firstName: "ANGELA", gender: "FEMALE", birthDate: new Date("1995-07-21") },
    { id: "4", lastName: "BAUTISTA", firstName: "CARLO MIGUEL", gender: "MALE", birthDate: new Date("1990-02-10") },
    { id: "5", lastName: "MENDOZA", firstName: "PATRICIA ANNE", gender: "FEMALE", birthDate: new Date("1993-09-28") },
    { id: "6", lastName: "GARCIA", firstName: "ROBERTO", suffix: "III", gender: "MALE", birthDate: new Date("1985-12-17") },
    { id: "7", lastName: "TORRES", firstName: "ELAINE", gender: "FEMALE", birthDate: new Date("1998-01-06") },
    { id: "8", lastName: "RAMOS", firstName: "VICTOR MANUEL", gender: "MALE", birthDate: new Date("1987-05-19") },
    { id: "9", lastName: "FLORES", firstName: "DIANA GRACE", gender: "FEMALE", birthDate: new Date("1996-03-12") },
    { id: "10", lastName: "NAVARRO", firstName: "LUIS", gender: "MALE", birthDate: new Date("1991-08-24") },
    { id: "11", lastName: "CASTILLO", firstName: "ANDREA JOY", gender: "FEMALE", birthDate: new Date("1997-10-05") },
    { id: "12", lastName: "DELGADO", firstName: "MARCO ANTONIO", gender: "MALE", birthDate: new Date("1989-06-30") },
    { id: "13", lastName: "HERRERA", firstName: "LIZA MAE", gender: "FEMALE", birthDate: new Date("1994-04-02") },
    { id: "14", lastName: "ORTEGA", firstName: "DANIEL", gender: "MALE", birthDate: new Date("1986-09-14") },
    { id: "15", lastName: "VARGAS", firstName: "CAMILLE ROSE", gender: "FEMALE", birthDate: new Date("1999-11-22") },
    { id: "16", lastName: "SALAZAR", firstName: "ENESTO", suffix: "JR.", gender: "MALE", birthDate: new Date("1990-07-09") },
    { id: "17", lastName: "AQUINO", firstName: "BEATRICE", gender: "FEMALE", birthDate: new Date("1998-02-26") },
    { id: "18", lastName: "DOMINGUEZ", firstName: "PAULO CESAR", gender: "MALE", birthDate: new Date("1988-11-03") },
    { id: "19", lastName: "PADILLA", firstName: "KAREN", gender: "FEMALE", birthDate: new Date("1988-11-03") },
    { id: "20", lastName: "VILLANUEVA", firstName: "OSCAR MIGUEL", gender: "MALE", birthDate: new Date("1984-06-11") },
    { id: "21", lastName: "GUTIERREZ", firstName: "SHEILA ANNE", gender: "FEMALE", birthDate: new Date("1996-01-29") },
    { id: "22", lastName: "CHAVEZ", firstName: "RICARDO", gender: "MALE", birthDate: new Date("1992-05-23") },
    { id: "23", lastName: "LIM", firstName: "JENNIFER", gender: "FEMALE", birthDate: new Date("1997-08-16") },
    { id: "24", lastName: "MERCADO", firstName: "ANTHONY LUIS", gender: "MALE", birthDate: new Date("1991-10-27") },
    { id: "25", lastName: "PINEDA", firstName: "CLARISSE MARIE", gender: "FEMALE", birthDate: new Date("1999-03-04") },
];
