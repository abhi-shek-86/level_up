import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function TaskHistory({ userId, totalDays }) {
  const [progress, setProgress] = useState({});

  useEffect(() => {
    const fetchProgress = async () => {
      const docRef = doc(db, 'users', userId);
      const userDoc = await getDoc(docRef);
      const data = userDoc.data();
      setProgress(data.progress || {});
    };

    fetchProgress();
  }, [userId]);

  return (
    <div className="history-box">
      <h3>📅 Task History</h3>
      {Object.entries(progress).map(([day, tasks]) => (
        <div key={day}>
          <strong>{day}:</strong>{' '}
          {Object.entries(tasks).map(([task, info]) => (
            <span key={task} style={{ marginRight: 10 }}>
              {task}: {info.done ? '✅' : '❌'}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}
