import React, { useState, useEffect } from 'react';
import {html2pdf} from 'html2pdf.js';
import './App.css';

function App() {
  const [subjects, setSubjects] = useState([]);
  const [lastAction, setLastAction] = useState(null);

  useEffect(() => {
    const storedSubjects = JSON.parse(localStorage.getItem('subjects'));
    if (storedSubjects) {
      setSubjects(storedSubjects);
    }
  }, []);

  const addSubject = () => {
    const newSubject = prompt('Enter subject name:');
    if (newSubject) {
      const updatedSubjects = [...subjects, { name: newSubject, present: 0, total: 0 }];
      setSubjects(updatedSubjects);
      localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
    }
  };

  const deleteSubject = (index) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this subject?');
    if (confirmDelete) {
      const updatedSubjects = [...subjects];
      updatedSubjects.splice(index, 1);
      setSubjects(updatedSubjects);
      localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
    }
  };

  const markPresent = (index) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index].present++;
    updatedSubjects[index].total++;
    setSubjects(updatedSubjects);
    localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
    setLastAction({ type: 'present', index });
  };

  const markAbsent = (index) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index].total++;
    setSubjects(updatedSubjects);
    localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
    setLastAction({ type: 'absent', index });
  };

  const undoLastAction = () => {
    if (lastAction) {
      const updatedSubjects = [...subjects];
      const { type, index } = lastAction;
      if (type === 'present') {
        updatedSubjects[index].present--;
        updatedSubjects[index].total--;
      } else if (type === 'absent') {
        updatedSubjects[index].total--;
      }
      setSubjects(updatedSubjects);
      localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
      setLastAction(null);
    }
  };

  const eraseData = () => {
    const confirmErase = window.confirm('Are you sure you want to erase all data? This action cannot be undone.');
    if (confirmErase) {
      downloadPDF();
      localStorage.removeItem('subjects');
      setSubjects([]);
    }
  };

  const downloadPDF = () => {
    const element = document.getElementById('attendance-table');
    html2pdf().from(element).save();
  };

  return (
    <div className="App">
      <h1>Attendance Tracker</h1>
      <div className='features'>
      <button onClick={addSubject}>Add Subject</button>
      <button onClick={eraseData}>Erase Data</button>
      <button onClick={undoLastAction} disabled={!lastAction}>Undo</button>
      </div>
      
      <div id="attendance-table">
        {subjects.map((subject, index) => (
          <div key={index} className="subject">
            <button className="delete-button" onClick={() => deleteSubject(index)}>❌</button> {/* Add delete button */}
            <h2>{subject.name}</h2>
            <p>Total Lec: {subject.total}</p>
            <p> Present: {subject.present}</p>
            <p> Absent: {subject.total - subject.present}</p>
            <button onClick={() => markPresent(index)}>P</button>
            <button onClick={() => markAbsent(index)}>A</button>
            <p>Percentage: {((subject.present / subject.total) * 100 || 0).toFixed(2)}%</p>
          </div>
        ))}
      </div>
      <div className='percentage'><h2 >Total Percentage: {(
          subjects.reduce((acc, curr) => acc + ((curr.present / curr.total) * 100 || 0), 0) / subjects.length || 0).toFixed(2)}%</h2>
      </div>

      <div className="watermark">DK</div>
    </div>
  );
}

export default App;
