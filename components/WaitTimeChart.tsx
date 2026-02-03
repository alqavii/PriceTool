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
import { expectedDaysToWaitMultiRoll } from '@/lib/gmm';

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

interface WaitTimeChartProps {
  buyPrice: number;
  sellPrice?: number;
  rollsPerDay: number;
}

export default function WaitTimeChart({
  buyPrice,
  sellPrice,
  rollsPerDay,
}: WaitTimeChartProps) {
  // If sell price is above 5500, show placeholder
  if (sellPrice && sellPrice > 5500) {
    return (
      <div className="w-full text-center py-8">
        <div className="text-4xl mb-2">📊</div>
        <div className="text-lg text-text-secondary">N/A</div>
        <div className="text-sm text-text-secondary mt-2">
          Sell price exceeds maximum range (5500)
        </div>
      </div>
    );
  }

  // Generate data points for target prices from sellPrice to 5500
  const targetPrices: number[] = [];
  const waitTimes: number[] = [];

  // Start from the user's sell price (or buyPrice if no sellPrice), round to next increment of 50
  const basePrice = sellPrice || buyPrice;
  const startPrice = Math.ceil(basePrice / 50) * 50;

  for (let targetPrice = startPrice; targetPrice <= 5500; targetPrice += 50) {
    const days = expectedDaysToWaitMultiRoll(targetPrice, rollsPerDay);
    // Cap at 100 days for visualization
    const cappedDays = Math.min(days, 100);

    targetPrices.push(targetPrice);
    waitTimes.push(cappedDays);
  }

  // Create data points with x,y coordinates
  const dataPoints = targetPrices.map((x, i) => ({ x, y: waitTimes[i] }));

  const data = {
    datasets: [
      {
        label: 'Expected Wait Time',
        data: dataPoints,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: false,
        tension: 0.3,
        borderWidth: 3,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#3b82f6',
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Expected Wait Time by Target Sell Price',
        color: '#f5f5f5',
        font: {
          size: 16,
          weight: 'bold',
        },
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
            const days = context.parsed.y?.toFixed(1) ?? 'N/A';
            return `Expected wait: ${days} days`;
          },
          afterLabel: function (context) {
            const days = context.parsed.y ?? 0;
            if (days >= 5) return '✅ Sell now!';
            if (days >= 2) return '⚖️ Borderline';
            return '⏳ Worth waiting';
          },
        },
      },
      annotation: {
        annotations: {
          // Red zone (0-2 days) - Worth waiting
          redZone: {
            type: 'box',
            yMin: 0,
            yMax: 2,
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            borderWidth: 1,
            label: {
              display: true,
              content: 'Worth Waiting',
            },
          },
          // Yellow zone (2-5 days) - Borderline
          yellowZone: {
            type: 'box',
            yMin: 2,
            yMax: 5,
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            borderColor: 'rgba(245, 158, 11, 0.3)',
            borderWidth: 1,
            label: {
              display: true,
              content: 'Borderline',
            },
          },
          // Green zone (5+ days) - Sell now!
          greenZone: {
            type: 'box',
            yMin: 5,
            yMax: 100,
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            borderColor: 'rgba(16, 185, 129, 0.3)',
            borderWidth: 1,
            label: {
              display: true,
              content: 'Sell Now',
            },
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        title: {
          display: true,
          text: 'Target Sell Price',
          color: '#f5f5f5',
          font: {
            weight: 'bold',
          },
        },
        grid: {
          color: '#3d3d3d',
        },
        ticks: {
          color: '#a3a3a3',
          callback: function(value) {
            return value.toLocaleString();
          },
        },
      },
      y: {
        type: 'logarithmic',
        title: {
          display: true,
          text: 'Expected Days to Wait (log scale)',
          color: '#f5f5f5',
          font: {
            weight: 'bold',
          },
        },
        grid: {
          color: '#3d3d3d',
        },
        ticks: {
          color: '#a3a3a3',
          callback: function(value) {
            return value.toLocaleString();
          },
        },
        min: 0.1,
        max: 100,
      },
    },
  };

  return (
    <div className="w-full">
      <Line data={data} options={options} />
      <div className="text-xs text-text-secondary mt-2 text-center">
        Shows exponential growth of wait time. Long wait times (green) mean sell now. Short wait times (red) mean it's worth waiting.
        {rollsPerDay > 1 && ` With ${rollsPerDay} price checks per day.`}
      </div>
    </div>
  );
}
