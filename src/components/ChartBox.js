import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const MONTHS = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

// Chuẩn hóa dữ liệu: nhận mảng object [{_id, count}] hoặc mảng số [0,1,2...]
function normalizeMonthlyArr(raw) {
  if (!raw) return Array(12).fill(0);
  // Nếu là mảng 12 số
  if (Array.isArray(raw) && raw.length === 12 && typeof raw[0] === "number") return raw;
  // Nếu là mảng object
  const arr = Array(12).fill(0);
  raw.forEach(item => {
    const idx = (item._id || item.month || 0) - 1;
    if (idx >= 0 && idx < 12) arr[idx] = item.count;
  });
  return arr;
}

const ChartBox = ({ blogs = [], comments = [], users = [], tags = [] }) => {
  const chartData = {
    labels: MONTHS,
    datasets: [
      {
        label: 'Bài viết',
        data: normalizeMonthlyArr(blogs),
        backgroundColor: 'rgba(108,92,231,0.8)',
        borderRadius: 7,
        barThickness: 20,
      },
      {
        label: 'Bình luận',
        data: normalizeMonthlyArr(comments),
        backgroundColor: 'rgba(253,203,110,0.85)',
        borderRadius: 7,
        barThickness: 20,
      },
      {
        label: 'Người dùng',
        data: normalizeMonthlyArr(users),
        backgroundColor: 'rgba(0,206,201,0.85)',
        borderRadius: 7,
        barThickness: 20,
      },
      {
        label: 'Tag',
        data: normalizeMonthlyArr(tags),
        backgroundColor: 'rgba(230, 34, 34, 0.92)', // Màu cam nổi bật, dễ phân biệt
        borderRadius: 7,
        barThickness: 20,
      },
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#2d3436', font: { size: 15, family: 'Poppins, sans-serif' } }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#2d3436',
          font: { size: 13 }
        },
        grid: { color: '#eef1fa' }
      },
      x: {
        ticks: {
          color: '#2d3436',
          font: { size: 13 }
        },
        grid: { color: '#eef1fa' }
      }
    }
  };

  return (
    <div style={{
      marginTop: 20,
      background: '#fff',
      padding: 20,
      borderRadius: 16,
      boxShadow: '0 1px 8px rgba(0,0,0,0.09)'
    }}>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default ChartBox;
