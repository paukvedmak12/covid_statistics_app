import React, { useEffect, useState } from 'react';
import { Table, Form } from 'react-bootstrap';
import CovidRecord from './CovidRecord';

interface CovidDataComponentProps {
  filters: {
    country: string;
    field: string;
    from: string;
    to: string;
  };
}

const CovidDataComponent: React.FC = () => {
  const [covidData, setCovidData] = useState<CovidRecord[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchCountry, setSearchCountry] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showAllDataButton, setShowAllDataButton] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://opendata.ecdc.europa.eu/covid19/casedistribution/json/');
        const data = await response.json();

        if (Array.isArray(data.records)) {
          const formattedData = data.records.map((record: any) => ({
            countriesAndTerritories: record.countriesAndTerritories,
            cases: record.cases,
            deaths: record.deaths,
            cases_total: record.cases,
            deaths_total: record.deaths,
            population: record.popData2019,
            dateRep: record.dateRep,
          }));

          setCovidData(formattedData);
        } else {
          console.error('Unexpected API response format:', data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    return () => {
      // Cleanup: any cleanup logic here
    };
  }, []);

  const calculateCasesPer1000 = (cases: number, population: number | undefined): number => {
    if (population && population > 0) {
      return (cases / population) * 1000;
    }
    return 0;
  };

  const calculateDeathsPer1000 = (deaths: number, population: number | undefined): number => {
    if (population && population > 0) {
      return (deaths / population) * 1000;
    }
    return 0;
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle the sort order if the same column is clicked again
      setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      // Set a new column and default to ascending order
      setSortColumn(column);
      setSortOrder('asc');
    }
  };

  const sortData = (data: CovidRecord[]) => {
    if (sortColumn) {
      return data.slice().sort((a, b) => {
        const aValue = a[sortColumn as keyof CovidRecord];
        const bValue = b[sortColumn as keyof CovidRecord];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
        }

        // For string comparison, convert to lowercase to make it case-insensitive
        const lowerA = String(aValue).toLowerCase();
        const lowerB = String(bValue).toLowerCase();

        return sortOrder === 'asc' ? lowerA.localeCompare(lowerB) : lowerB.localeCompare(lowerA);
      });
    }

    return data;
  };

  const filterData = () => {
    const filteredData = covidData
      .filter((record) => {
        const date = record.dateRep ? new Date(record.dateRep) : null;
        const isDateInRange =
          (!startDate || !endDate) ||
          (date && date >= new Date(startDate) && date <= new Date(endDate));

        const matchesSearch =
          !searchCountry ||
          record.countriesAndTerritories.toLowerCase().includes(searchCountry.toLowerCase());

        return isDateInRange && matchesSearch;
      })
      .map((record) => ({
        ...record,
        casesPer1k: calculateCasesPer1000(record.cases, record.population),
        deathsPer1k: calculateDeathsPer1000(record.deaths, record.population),
      }));

    return sortData(filteredData);
  };

  const handleShowAllData = () => {
    setStartDate('');
    setEndDate('');
    setShowAllDataButton(false);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    setShowAllDataButton(true);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    setShowAllDataButton(true);
  };

  return (
    <div>
      <h1>COVID-19 Data</h1>
      <Form.Group>
        <Form.Label>Select Period:</Form.Label>
        <Form.Control
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          max={covidData.length > 0 ? covidData[0].dateRep : ''}
        />
        <br></br>
        <Form.Control
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          max={covidData.length > 0 ? covidData[0].dateRep : ''}
        />
      </Form.Group>
      <Form.Group>
      <br></br>
        <Form.Label>Search by Country:</Form.Label>
        <Form.Control
          type="text"
          placeholder="Enter country name"
          value={searchCountry}
          onChange={(e) => setSearchCountry(e.target.value)}
        />
        <br></br>
      </Form.Group>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th onClick={() => handleSort('countriesAndTerritories')}>Country</th>
            <th onClick={() => handleSort('cases')}>Cases</th>
            <th onClick={() => handleSort('deaths')}>Deaths</th>
            <th onClick={() => handleSort('cases_total')}>Total Cases</th>
            <th onClick={() => handleSort('deaths_total')}>Total Deaths</th>
            <th onClick={() => handleSort('casesPer1k')}>Cases per 1000 People</th>
            <th onClick={() => handleSort('deathsPer1k')}>Deaths per 1000 People</th>
          </tr>
        </thead>
        <tbody>
          {filterData().map((record, index) => (
            <tr key={index}>
              <td>{record.countriesAndTerritories}</td>
              <td>{record.cases}</td>
              <td>{record.deaths}</td>
              <td>{record.cases_total}</td>
              <td>{record.deaths_total}</td>
              <td>{record.casesPer1k?.toFixed(2)}</td>
              <td>{record.deathsPer1k?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CovidDataComponent;
