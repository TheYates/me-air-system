"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }>;
  title?: string;
  stacked?: boolean;
}

export function BarChartComponent({
  labels,
  datasets,
  title,
  stacked = false,
}: BarChartProps) {
  const chartData = {
    labels,
    datasets: datasets.map((dataset) => ({
      ...dataset,
      borderRadius: 4,
      borderSkipped: false,
    })),
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "x" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      title: title
        ? {
            display: true,
            text: title,
          }
        : undefined,
    },
    scales: {
      x: {
        stacked: stacked,
        ticks: {
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11,
          },
          callback: function(value, index) {
            const label = labels[index];
            // Truncate labels longer than 15 characters on mobile
            if (typeof window !== 'undefined' && window.innerWidth < 768) {
              return label.length > 12 ? label.substring(0, 12) + '...' : label;
            }
            return label;
          },
        },
      },
      y: {
        stacked: stacked,
        beginAtZero: true,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}
