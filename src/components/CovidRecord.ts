interface CovidRecord {
    countriesAndTerritories: string;
    cases: number;
    deaths: number;
    cases_total: number;
    deaths_total: number;
    casesPer1k?: number;
    deathsPer1k?: number;
    dateRep?: string;
    population?: number;
  }
  
  export default CovidRecord;
  