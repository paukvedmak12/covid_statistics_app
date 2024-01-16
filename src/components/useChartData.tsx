import { ChartConfiguration } from 'chart.js/auto';
import CovidRecord from './CovidRecord';

const useChartData = (covidData: CovidRecord[]): ChartConfiguration => {
  const labels = covidData.map((record) => record.dateRep);
  const casesData = covidData.map((record) => record.cases);
  const deathsData = covidData.map((record) => record.deaths);

  const chartData: ChartConfiguration = {
    type: 'line', // Change the type to 'line'
    data: {
      labels,
      datasets: [
        {
          label: 'Diseases',
          data: casesData,
          fill: false,
          borderColor: 'yellow',
        },
        {
          label: 'Death',
          data: deathsData,
          fill: false,
          borderColor: 'red',
        },
      ],
    },
    options: {
      scales: {
        x: {
          type: 'category',
          labels,
          display: true,
        },
        y: {
          beginAtZero: true,
          display: true,
        },
      },
    },
  };

  return chartData;
};

export default useChartData;
