import React from 'react';
import { Card, Row, Col } from 'antd';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

const barData = {
  labels: ['Math', 'Science', 'English', 'History', 'Art'],
  datasets: [
    {
      label: 'Quiz Scores',
      data: [85, 90, 78, 88, 95],
      backgroundColor: 'rgba(24, 144, 255, 0.6)',
    },
  ],
};

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      reverse: false, // This ensures 0% is at bottom and 100% is at top
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
};

const lineData = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Progress Over Time',
      data: [60, 70, 80, 90],
      fill: false,
      borderColor: 'rgba(82, 196, 26, 0.8)',
      tension: 0.1,
    },
  ],
};

const lineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      reverse: false, // This ensures 0% is at bottom and 100% is at top
    },
  },
  plugins: {
    legend: {
      display: false,
    },
  },
};

const pieData = {
  labels: ['Correct', 'Incorrect', 'Skipped'],
  datasets: [
    {
      label: 'Quiz Results',
      data: [70, 20, 10],
      backgroundColor: [
        'rgba(82, 196, 26, 0.7)',
        'rgba(255, 77, 79, 0.7)',
        'rgba(250, 173, 20, 0.7)',
      ],
      borderWidth: 1,
    },
  ],
};

const AnalyticsChart = () => (
  <div>
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12} lg={8}>
        <Card title="Bar Chart: Quiz Scores">
          <div style={{ height: '300px' }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </Card>
      </Col>
      <Col xs={24} md={12} lg={8}>
        <Card title="Line Chart: Progress Over Time">
          <div style={{ height: '300px' }}>
            <Line data={lineData} options={lineOptions} />
          </div>
        </Card>
      </Col>
      <Col xs={24} md={12} lg={8}>
        <Card title="Pie Chart: Quiz Results">
          <div style={{ height: '300px' }}>
            <Pie data={pieData} />
          </div>
        </Card>
      </Col>
    </Row>
  </div>
);

export default AnalyticsChart; 