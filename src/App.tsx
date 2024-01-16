import React from 'react';
import { Container, Tabs, Tab } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import CovidDataComponent from './components/CovidDataComponent';
import LineChart from './components/ChartComponent';
import CovidRecord from './components/CovidRecord';

const App: React.FC = () => {
  const [covidData, setCovidData] = React.useState<CovidRecord[]>([]);

  React.useEffect(() => {
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
  }, []);

  return (
    <Container>
      <Tabs defaultActiveKey="table" id="data-tabs">
        <Tab eventKey="table" title="Table">
          <CovidDataComponent />
        </Tab>
        <Tab eventKey="chart" title="Graph">
          <LineChart covidData={covidData} startDate="" endDate="" />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default App;
