import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function DayCard({ day, tasks, userId, totalTasks, onStreakUpdate }) {
  const [notes, setNotes] = useState({});
  const [completed, setCompleted] = useState({});

  const dayKey = `Day${day}`; // Change to match "Day1", "Day2", etc.

  useEffect(() => {
    const fetchData = async () => {
      const userRef = doc(db, 'users', userId);
      const snap = await getDoc(userRef);
      const data = snap.data();

      if (data?.progress?.[dayKey]) {
        const dayProgress = data.progress[dayKey];
        setNotes(
          Object.fromEntries(tasks.map(task => [task, dayProgress[task]?.note || ""]))
        );
        setCompleted(
          Object.fromEntries(tasks.map(task => [task, dayProgress[task]?.done || false]))
        );
      }
    };
    fetchData();
  }, [day, userId, tasks]);

  const handleComplete = async (task) => {
    const updatedNotes = {
      ...notes,
      [task]: notes[task] || "",
    };

    const updatedCompleted = {
      ...completed,
      [task]: true,
    };

    setCompleted(updatedCompleted);

    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      [`progress.${dayKey}.${task}`]: {
        note: updatedNotes[task],
        done: true, // Use "done" for consistency
      },
    });

    // ✅ Check if all tasks are completed
    const allDone = Object.values(updatedCompleted).filter(Boolean).length === totalTasks;

    if (allDone) {
      const snap = await getDoc(userRef);
      const currentStreak = snap.data()?.streak || 0;
      await updateDoc(userRef, {
        streak: currentStreak + 1,
      });
      if (onStreakUpdate) onStreakUpdate(currentStreak + 1); // Notify parent
      alert(`🔥 All tasks done! Streak increased to ${currentStreak + 1}`);
    }
  };

  return (
    <div className="day-card">
      <h4>Day {day}</h4>
      {tasks.map((task, idx) => (
        <div key={idx} className="task-block">
          <h5>{task}</h5>
          <textarea
            placeholder="What did you learn?"
            value={notes[task] || ""}
            onChange={(e) =>
              setNotes({ ...notes, [task]: e.target.value })
            }
            disabled={completed[task]}
          />
          <button
            onClick={() => handleComplete(task)}
            disabled={completed[task] || !notes[task] || notes[task].trim() === ""}
          >
            {completed[task] ? "✅ Completed" : "Mark Completed"}
          </button>
        </div>
      ))}
    </div>
  );
}
