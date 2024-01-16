import React, { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import CovidRecord from './CovidRecord';

type CustomChartDataset = {
  label: string;
  data: number[];
  fill?: boolean;
  borderColor?: string;
};

interface ChartProps {
    covidData: CovidRecord[];
    startDate?: string;
    endDate?: string;
  }
  

const ChartComponent: React.FC<ChartProps> = ({ covidData }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    const generateChart = () => {
      if (chartRef.current) {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }

        const ctx = chartRef.current.getContext('2d');
        if (ctx) {
          const dataToUse = selectedCountry
            ? covidData.filter((record) => record.countriesAndTerritories === selectedCountry)
            : covidData;

          const filteredData = dataToUse.filter(
            (record) =>
              record.dateRep !== undefined &&
              (!startDate || record.dateRep >= startDate) &&
              (!endDate || record.dateRep <= endDate)
          );

          const labels = filteredData.map((record) => record.dateRep || ''); // Use dateRep as labels
          const casesData = filteredData.map((record) => record.cases);
          const deathsData = filteredData.map((record) => record.deaths);

          const mainChartDatasets: CustomChartDataset[] = [
            {
              label: 'Diseases',
              data: casesData,
              fill: false,
              borderColor: 'yellow',
            },
          ];

          const latestStatsDatasets: CustomChartDataset[] = [
            {
              label: 'Death',
              data: deathsData,
              fill: false,
              borderColor: 'red',
            },
          ];

          const chartData: ChartConfiguration['data'] = {
            labels,
            datasets: [...mainChartDatasets, ...latestStatsDatasets],
          };

          const chartOptions: ChartConfiguration['options'] = {
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
          };

          chartInstanceRef.current = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: chartOptions,
          });
        }
      }
    };

    generateChart();
  }, [covidData, startDate, endDate, selectedCountry]);

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value || null);
  };

  return (
    <div>
      <label>Start Date:</label>
      <input type="date" value={startDate} onChange={handleStartDateChange} />

      <label>End Date:</label>
      <input type="date" value={endDate} onChange={handleEndDateChange} />

      <label>Select Country:</label>
      <select value={selectedCountry || ''} onChange={handleCountryChange}>
        <option value="">All Countries</option>
        {Array.from(new Set(covidData.map((record) => record.countriesAndTerritories))).map(
          (country) => (
            <option key={country} value={country}>
              {country}
            </option>
          )
        )}
      </select>

      <canvas ref={chartRef} />
    </div>
  );
};

export default ChartComponent;
