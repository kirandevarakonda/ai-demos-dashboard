import { useEffect, useRef } from "react";

interface HealthTrendsChartProps {
  data: any[];
}

export function HealthTrendsChart({ data }: HealthTrendsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Dynamically import Chart.js to avoid SSR issues
    import('chart.js/auto').then((Chart) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (!ctx) return;

      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // Process health data for chart
      const processedData = processHealthData(data);

      chartRef.current = new Chart.default(ctx, {
        type: 'line',
        data: {
          labels: processedData.labels,
          datasets: [
            {
              label: 'Blood Pressure (Systolic)',
              data: processedData.systolic,
              borderColor: '#2563eb',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              tension: 0.4,
              fill: true,
            },
            {
              label: 'Heart Rate',
              data: processedData.heartRate,
              borderColor: '#059669',
              backgroundColor: 'rgba(5, 150, 105, 0.1)',
              tension: 0.4,
              fill: true,
            },
            {
              label: 'Weight',
              data: processedData.weight,
              borderColor: '#f59e0b',
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              tension: 0.4,
              fill: true,
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom' as const,
              labels: {
                usePointStyle: true,
                padding: 20,
              },
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            },
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Time Period',
              },
              grid: {
                display: false,
              },
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: {
                display: true,
                text: 'Blood Pressure / Heart Rate',
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.1)',
              },
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Weight (lbs)',
              },
              grid: {
                drawOnChartArea: false,
              },
            },
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
          },
        },
      });
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data]);

  const processHealthData = (healthRecords: any[]) => {
    // Sort records by date
    const sortedRecords = [...healthRecords]
      .filter(record => record.data && typeof record.data === 'object')
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-10); // Last 10 records

    if (sortedRecords.length === 0) {
      return {
        labels: ['No Data'],
        systolic: [0],
        heartRate: [0],
        weight: [0],
      };
    }

    const labels = sortedRecords.map((record, index) => {
      const date = new Date(record.createdAt);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const systolic = sortedRecords.map(record => record.data.bloodPressureSystolic || null);
    const heartRate = sortedRecords.map(record => record.data.heartRate || null);
    const weight = sortedRecords.map(record => record.data.weight || null);

    return {
      labels,
      systolic,
      heartRate,
      weight,
    };
  };

  return (
    <div className="w-full h-64 relative">
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <i className="fas fa-chart-line text-slate-400"></i>
            </div>
            <p className="text-sm text-slate-600">No health data available</p>
            <p className="text-xs text-slate-500">Upload health records to see trends</p>
          </div>
        </div>
      ) : (
        <canvas ref={canvasRef} className="w-full h-full" />
      )}
    </div>
  );
}
