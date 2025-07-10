import { useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function StreakTracker({ userId, totalDays, streak }) {
  useEffect(() => {
    const calculateStreak = async () => {
      const docRef = doc(db, 'users', userId);
      const userDoc = await getDoc(docRef);
      const data = userDoc.data();
      const progress = data.progress || {};

      let tempStreak = 0;

      // Check from Day 1 → Day N
      for (let i = 1; i <= totalDays; i++) {
        const dayData = progress[`Day${i}`];
        if (!dayData) break;

        const allDone = Object.values(dayData).every(t => t.done);
        if (allDone) tempStreak++;
        else break; // missed day → break streak
      }

      // Removed setStreak as we're using the streak from props now
    };

    calculateStreak();
  }, [userId, totalDays]);

  return (
    <div className="streak-box">
      <h3>🔥 Streak: {streak} day(s)</h3>
    </div>
  );
}
