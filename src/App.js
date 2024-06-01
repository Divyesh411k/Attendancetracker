import React, { useState, useEffect } from 'react';
import './App.css';
import jsPDF from 'jspdf';

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

  const downloadData = () => {
    const doc = new jsPDF();

    doc.text('Attendance Data', 20, 20);
    
    let y = 30;
    subjects.forEach((subject, index) => {
      doc.text(`Subject: ${subject.name}`, 20, y);
      y += 10;
      doc.text(`Total Lectures: ${subject.total}`, 20, y);
      y += 10;
      doc.text(`Present: ${subject.present}`, 20, y);
      y += 10;
      doc.text(`Absent: ${subject.total - subject.present}`, 20, y);
      y += 10;
      doc.text(`Percentage: ${((subject.present / subject.total) * 100 || 0).toFixed(2)}%`, 20, y);
      y += 20;
    });
    const totalPercentage = (
      subjects.reduce((acc, curr) => acc + ((curr.present / curr.total) * 100 || 0), 0) / subjects.length || 0
    ).toFixed(2);
    doc.text(`Total Attendance Percentage: ${totalPercentage}%`, 20, y);

    doc.save('attendance_data.pdf');
  };

  const removeAllSubjects = () => {
    const confirmDelete = window.confirm('Are you sure you want to remove all subjects?');
    if (confirmDelete) {
      setSubjects([]);
      localStorage.removeItem('subjects');
    }
  };

  return (
    <div className="App">
      <h1>Attendance Tracker</h1>
      <div className='features'>
        <button onClick={addSubject}>Add Subject</button>
        <button onClick={undoLastAction} disabled={!lastAction}>Undo</button>
        <button onClick={downloadData}>Download Data</button>
        <button onClick={removeAllSubjects}>Remove All Subjects</button>
      </div>

      <div id="attendance-table">
        {subjects.map((subject, index) => (
          <div key={index} className="subject">
            <button className="delete-button" onClick={() => deleteSubject(index)}>❌</button>
            <h2>{subject.name}</h2>
            <p>Total Lec: {subject.total}</p>
            <p>Present: {subject.present}</p>
            <p>Absent: {subject.total - subject.present}</p>
            <button onClick={() => markPresent(index)}>P</button>
            <button onClick={() => markAbsent(index)}>A</button>
            <p>Percentage: {((subject.present / subject.total) * 100 || 0).toFixed(2)}%</p>
          </div>
        ))}
      </div>
      <div className='percentage'>
        <h2>Total Percentage: {(
          subjects.reduce((acc, curr) => acc + ((curr.present / curr.total) * 100 || 0), 0) / subjects.length || 0).toFixed(2)}%</h2>
      </div>

      <div className="watermark">DK</div>
    </div>
  );
}

export default App;
