"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    tension?: number;
    fill?: boolean;
  }>;
  title?: string;
}

export function LineChartComponent({
  labels,
  datasets,
  title,
}: LineChartProps) {
  const chartData = {
    labels,
    datasets: datasets.map((dataset) => ({
      ...dataset,
      tension: dataset.tension ?? 0.4,
      fill: dataset.fill ?? false,
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: "#fff",
      pointBorderWidth: 2,
    })),
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: title
        ? {
            display: true,
            text: title,
          }
        : undefined,
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={chartData} options={options} />;
}

