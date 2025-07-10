import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

import TaskInput from './TaskInput';
import DayCard from './DayCard';
import StreakTracker from './StreakTracker';
import TaskHistory from './TaskHistory';
import ProgressChart from './ProgressChart';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [days, setDays] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [showSetup, setShowSetup] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks');
  const [currentDay, setCurrentDay] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [streak, setStreak] = useState(0);
  const [completed, setCompleted] = useState({});
  const [tempDays, setTempDays] = useState(days);
  const [tempTasks, setTempTasks] = useState(tasks);
  const navigate = useNavigate();

  // 🔁 Detect logged-in user
  useEffect(() => {
    auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        const userRef = doc(db, 'users', u.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          const data = snap.data();
          setDays(data.days);
          setTasks(data.tasks);
          setStreak(data.streak || 0);

          // Calculate current day
          const start = new Date(data.startDate);
          const today = new Date();
          const diff = Math.floor((today - start) / (1000 * 60 * 60 * 24));
          const dayNum = data.days - diff;
          if (dayNum < 1) {
            alert("🎉 Challenge complete!");
          } else {
            setCurrentDay(dayNum);
          }

          // Streak reset logic
          const lastProgressDay = Math.max(
            ...Object.keys(data.progress || {}).map(d =>
              parseInt(d.replace(/\D/g, ''), 10)
            ),
            0
          );
          if (lastProgressDay < data.days - diff) {
            // Missed a day
            await setDoc(userRef, { streak: 0 }, { merge: true });
          }
        } else {
          // setShowSetup(true); // REMOVE THIS LINE
          // Optionally: navigate('/'); // or show a message
        }
      }
    });
  }, []);

  // ✅ Save settings (for new users)
  const saveSettings = async (daysArg, tasksArg) => {
    if (!user) return alert("User not available");

    if (!daysArg || daysArg <= 0) return alert("Enter a valid number of days");
    if (tasksArg.length === 0 || tasksArg.some((t) => t.trim() === ''))
      return alert("Add at least one valid task");

    const userRef = doc(db, 'users', user.uid);

    if (editMode) {
      await setDoc(userRef, {
        days: daysArg,
        tasks: tasksArg,
      }, { merge: true });
    } else {
      const userData = {
        username: user.displayName || 'Anonymous',
        days: daysArg,
        tasks: tasksArg,
        streak: 0,
        startDate: new Date().toISOString(),
        progress: {},
      };
      await setDoc(userRef, userData);
    }

    setShowSetup(false);
    setEditMode(false);
    setCurrentDay(daysArg);
  };

  const logout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleComplete = (task) => {
    setCompleted((prev) => ({ ...prev, [task]: !prev[task] }));
  };

  // When opening setup (add/edit)
  const openSetup = (edit = false) => {
    setEditMode(edit);
    setTempDays(days);
    setTempTasks(Array.isArray(tasks) ? [...tasks] : []);
    setShowSetup(true);
  };

  // Helper: is this a new user?
  const isNewUser = !days || days <= 0 || !tasks || tasks.length === 0;

  return (
    <div className="dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Level Up Dashboard</h2>
        <div>
          <span style={{ marginRight: 16 }} className="username-highlight">
            {user?.displayName || user?.email}
          </span>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Setup Popup */}
      {showSetup && (
        <div className="popup-backdrop">
          <div className="popup">
            <h3>🎯 {editMode ? "Edit Your Challenge" : "Set Your Challenge"}</h3>
            <input
              type="number"
              min="1"
              placeholder="Enter days (e.g. 60)"
              value={tempDays}
              onChange={(e) => {
                const val = Number(e.target.value);
                if (val < 1) {
                  setTempDays('');
                } else {
                  setTempDays(val);
                }
              }}
            />
            <TaskInput tasks={tempTasks} setTasks={setTempTasks} />
            <div className="popup-btn-row">
              <button
                className="save-btn"
                onClick={async () => {
                  // Only update main state if valid and saved
                  if (!tempDays || tempDays <= 0) return alert("Enter a valid number of days");
                  if (tempTasks.length === 0 || tempTasks.some((t) => t.trim() === ''))
                    return alert("Add at least one valid task");
                  setDays(tempDays);
                  setTasks(tempTasks);
                  await saveSettings(tempDays, tempTasks);
                }}
              >
                {editMode ? "Update" : "Save & Start"}
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setShowSetup(false);
                  setEditMode(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Only show dashboard content if not a new user */}
      {!showSetup && !isNewUser && currentDay && (
        <div className="center-info">
          <span>
            <span className="circle-count">{currentDay}</span>
            Days
          </span>
          <span>
            <span className="circle-count streak-circle">{streak}</span>
            Streak
          </span>
        </div>
      )}

      {!showSetup && (
        <>
          <div className="tab-controls">
            <button
              onClick={() => {
                setActiveTab('tasks');
                setEditMode(false);
                setTasks(tasks || []);
                openSetup(false);
              }}
              className={activeTab === 'tasks' ? 'active' : ''}
            >
              ✅ Tasks
            </button>
            <button
              onClick={() => setActiveTab('streak')}
              className={activeTab === 'streak' ? 'active' : ''}
            >
              🔥 Streak
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={activeTab === 'history' ? 'active' : ''}
            >
              📅 History
            </button>
            <button
              onClick={() => setActiveTab('chart')}
              className={activeTab === 'chart' ? 'active' : ''}
            >
              📊 Chart
            </button>
          </div>
          <div className="tab-content">
            {/* Show suggestion for new users in tab content */}
            {isNewUser ? (
              <div className="welcome-suggestion">
                <h3>👋 Welcome to Level Up!</h3>
                <p>
                  To get started, click <b>Tasks</b> below and set your challenge:
                </p>
                <ul>
                  <li>Enter the <b>number of days</b> for your challenge</li>
                  <li>Add your <b>study topics or tasks</b> (e.g., Python, SQL, Math...)</li>
                  <li>Save to begin your learning journey!</li>
                </ul>
              </div>
            ) : (
              <>
                {activeTab === 'tasks' && currentDay && (
                  <>
                    <button
                      style={{ float: 'right', marginBottom: 10 }}
                      onClick={() => openSetup(true)}
                    >
                      Edit Tasks / Days
                    </button>
                    <DayCard
                      day={currentDay}
                      tasks={tasks}
                      userId={user.uid}
                      totalTasks={tasks.length}
                      onStreakUpdate={setStreak}
                    />
                  </>
                )}
                {activeTab === 'streak' && (
                  <StreakTracker userId={user.uid} totalDays={days} streak={streak} />
                )}
                {activeTab === 'history' && (
                  <TaskHistory userId={user.uid} totalDays={days} />
                )}
                {activeTab === 'chart' && (
                  <ProgressChart userId={user.uid} totalDays={days} />
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
