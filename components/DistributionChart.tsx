'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { pdfGMM } from '@/lib/gmm';
import { DISTRIBUTION_PARAMS } from '@/lib/constants';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  annotationPlugin
);

interface DistributionChartProps {
  buyPrice: number;
  sellPrice?: number;
}

export default function DistributionChart({
  buyPrice,
  sellPrice,
}: DistributionChartProps) {
  // Generate data points for the distribution curve
  const min = DISTRIBUTION_PARAMS.overall.min;
  const max = DISTRIBUTION_PARAMS.overall.max;
  const step = 50;

  const labels: number[] = [];
  const pdfValues: number[] = [];

  for (let x = min; x <= max; x += step) {
    labels.push(x);
    pdfValues.push(pdfGMM(x));
  }

  // Create data points with x,y coordinates for linear scale
  const dataPoints = labels.map((x, i) => ({ x, y: pdfValues[i] }));

  const data = {
    datasets: [
      {
        label: 'Price Distribution',
        data: dataPoints,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
      },
    ],
  };

  const annotations: any = {
    buyPriceLine: {
      type: 'line',
      xMin: buyPrice,
      xMax: buyPrice,
      borderColor: '#06b6d4',
      borderWidth: 3,
      borderDash: [5, 5],
      label: {
        content: `Buy: ${buyPrice}`,
        enabled: true,
        position: 'start',
        backgroundColor: 'rgba(6, 182, 212, 0.8)',
        color: '#f5f5f5',
        padding: 4,
      },
    },
  };

  if (sellPrice) {
    annotations.sellPriceLine = {
      type: 'line',
      xMin: sellPrice,
      xMax: sellPrice,
      borderColor: '#10b981',
      borderWidth: 3,
      borderDash: [5, 5],
      label: {
        content: `Sell: ${sellPrice}`,
        enabled: true,
        position: 'start',
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        color: '#f5f5f5',
        padding: 4,
      },
    };

    if (sellPrice > buyPrice) {
      annotations.profitZone = {
        type: 'box',
        xMin: buyPrice,
        xMax: sellPrice,
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderColor: 'rgba(16, 185, 129, 0.5)',
        borderWidth: 1,
      };
    }
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(45, 45, 45, 0.95)',
        titleColor: '#f5f5f5',
        bodyColor: '#a3a3a3',
        borderColor: '#3d3d3d',
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            return `Probability: ${context.parsed.y.toFixed(6)}`;
          },
        },
      },
      annotation: {
        annotations,
      },
    },
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: 'Price',
          color: '#f5f5f5',
        },
        grid: {
          color: '#3d3d3d',
        },
        ticks: {
          color: '#a3a3a3',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Probability Density',
          color: '#f5f5f5',
        },
        grid: {
          color: '#3d3d3d',
        },
        ticks: {
          color: '#a3a3a3',
        },
      },
    },
  };

  return (
    <div className="w-full">
      <Line data={data} options={options} />
    </div>
  );
}
