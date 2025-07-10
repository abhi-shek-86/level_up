import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function ProgressChart({ userId, totalDays }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const docRef = doc(db, 'users', userId);
      const userDoc = await getDoc(docRef);
      const data = userDoc.data();
      const progress = data.progress || {};

      const dayData = [];

      for (let i = 1; i <= totalDays; i++) {
        const day = `Day${i}`;
        if (progress[day]) {
          const completed = Object.values(progress[day]).filter(t => t.done).length;
          const total = Object.keys(progress[day]).length;
          dayData.push((completed / total) * 100);
        } else {
          dayData.push(0);
        }
      }

      setChartData(dayData);
    };

    fetchData();
  }, [userId, totalDays]);

  return (
    <div>
      <h3>📊 Progress Overview</h3>
      <Bar
        data={{
          labels: Array.from({ length: totalDays }, (_, i) => `Day ${i + 1}`),
          datasets: [
            {
              label: 'Completion %',
              data: chartData,
              backgroundColor: 'rgba(59, 130, 246, 0.6)',
            },
          ],
        }}
        options={{
          scales: {
            y: {
              max: 100,
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
}
