import React, { useState, useEffect, useMemo } from 'react';
import './style.css';

const MONTHS = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const HOLIDAYS = {
  '0-1': { name: "New Year's Day", desc: "A fresh start to the year!" },
  '0-26': { name: 'Republic Day', desc: "Honors the date India's constitution came into effect." },
  '1-14': { name: "Valentine's Day", desc: "A day celebrating love and affection around the world." },
  '3-14': { name: 'Dr. Ambedkar Jayanti', desc: "Marks the birthday of Dr. B.R. Ambedkar, the architect of the Indian Constitution." },
  '7-15': { name: 'Independence Day', desc: "Commemorates the nation's independence from the United Kingdom." },
  '9-2': { name: 'Gandhi Jayanti', desc: "Celebrates the birth anniversary of Mahatma Gandhi." },
  '10-11': { name: 'Veterans Day', desc: "Honoring all military veterans who have served in the armed forces." },
  '11-25': { name: 'Christmas', desc: "An annual festival commemorating the birth of Jesus Christ." },
  '11-31': { name: "New Year's Eve", desc: "The final day of the year, getting ready to ring in the new one." }
};

export default function App() {
  const cur = new Date();
  const [viewYear, setViewYear] = useState(cur.getFullYear());
  const [viewMonth, setViewMonth] = useState(cur.getMonth());
  
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);
  
  const [notes, setNotes] = useState({});
  const [theme, setTheme] = useState('');
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const savedNotes = localStorage.getItem('calendar-notes');
    if (savedNotes) {
      try { setNotes(JSON.parse(savedNotes)); } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(notes).length > 0) {
      localStorage.setItem('calendar-notes', JSON.stringify(notes));
    }
  }, [notes]);

  const getKey = () => `${viewYear}-${viewMonth}`;
  const toDateObj = (o) => new Date(o.y, o.m, o.d);
  const cmpDate = (a, b) => toDateObj(a) - toDateObj(b);

  const handlePrevMonth = () => {
    setViewMonth(prev => {
      if (prev === 0) { setViewYear(y => y - 1); return 11; }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setViewMonth(prev => {
      if (prev === 11) { setViewYear(y => y + 1); return 0; }
      return prev + 1;
    });
  };

  const handleClearSelection = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setHoveredDate(null);
  };

  const handleDayClick = (obj) => {
    if (!rangeStart) {
      setRangeStart(obj);
      setRangeEnd(null);
    } else if (!rangeEnd) {
      if (cmpDate(obj, rangeStart) === 0) {
        setRangeStart(null);
      } else {
        let newEnd = obj;
        let newStart = rangeStart;
        if (cmpDate(rangeStart, newEnd) > 0) {
          newStart = newEnd;
          newEnd = rangeStart;
        }
        setRangeStart(newStart);
        setRangeEnd(newEnd);
      }
      setHoveredDate(null);
    } else {
      setRangeStart(obj);
      setRangeEnd(null);
    }
  };

  const getRangeDisplayText = () => {
    if (!rangeStart) return 'Click a date to start';
    const fmt = (d) => `${MONTHS_SHORT[d.m]} ${d.d}`;
    if (!rangeEnd || (rangeStart.y === rangeEnd.y && rangeStart.m === rangeEnd.m && rangeStart.d === rangeEnd.d)) {
      const holData = HOLIDAYS[`${rangeStart.m}-${rangeStart.d}`];
      return fmt(rangeStart) + (holData ? ` — ${holData.name}` : '');
    } else {
      return `${fmt(rangeStart)} → ${fmt(rangeEnd)}`;
    }
  };

  const calendarDays = useMemo(() => {
    const today = new Date();
    const first = new Date(viewYear, viewMonth, 1);
    const startDow = (first.getDay() + 6) % 7; 
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevDays = new Date(viewYear, viewMonth, 0).getDate();

    let rs = rangeStart;
    let re = rangeEnd;
    if (rs && re && cmpDate(rs, re) > 0) {
      const temp = rs; rs = re; re = temp;
    }

    const cells = [];

    for (let i = 0; i < startDow; i++) {
      const d = prevDays - startDow + 1 + i;
      cells.push({ type: 'empty', day: d, key: `prev-${i}` });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dow = (startDow + d - 1) % 7;
      const isWeekend = (dow === 5 || dow === 6);
      const isToday = today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;
      const obj = { y: viewYear, m: viewMonth, d };
      const holKey = `${viewMonth}-${d}`;
      const holidayData = HOLIDAYS[holKey];

      let classes = ['day-cell'];
      if (isWeekend) classes.push('weekend');
      if (isToday) classes.push('today');
      if (holidayData) classes.push('holiday');

      if (rs) {
        const curObj = { y: viewYear, m: viewMonth, d };
        const cmpS = cmpDate(curObj, rs);
        const cmpE = re ? cmpDate(curObj, re) : cmpDate(curObj, rs);
        const isStart = cmpDate(curObj, rs) === 0;
        const isEnd = re && cmpDate(curObj, re) === 0;

        if (isStart) classes.push('range-start');
        else if (isEnd) classes.push('range-end');
        else if (re && cmpS > 0 && cmpE < 0) classes.push('in-range');
        else if (!re && hoveredDate) {
          const lo = cmpDate(rs, hoveredDate) < 0 ? rs : hoveredDate;
          const hi = cmpDate(rs, hoveredDate) < 0 ? hoveredDate : rs;
          if (cmpDate(curObj, lo) > 0 && cmpDate(curObj, hi) < 0) classes.push('in-range');
          if (cmpDate(curObj, hi) === 0 && !isStart) classes.push('range-end');
        }
      }

      cells.push({
        type: 'active',
        day: d,
        obj,
        classes: classes.join(' '),
        holiday: holidayData || null,
        key: `day-${d}`
      });
    }

    const totalCells = startDow + daysInMonth;
    const trailing = (7 - totalCells % 7) % 7;
    for (let i = 1; i <= trailing; i++) {
      cells.push({ type: 'empty', day: i, key: `next-${i}` });
    }

    return cells;
  }, [viewYear, viewMonth, rangeStart, rangeEnd, hoveredDate]);

  return (
    <div className={`calendar-app-wrapper ${theme}`}>
      <div className="outer">
        <div className="spine">
          {Array.from({ length: 6 }).map((_, i) => (
            <React.Fragment key={i}>
              <div className="hole"></div>
              <div className="wire-loop"></div>
            </React.Fragment>
          ))}
          <div className="hole"></div>
        </div>

        <div className="cal-card">
          <div className="hero">
            <svg className="hero-svg" viewBox="0 0 900 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d2d5e" />
                  <stop offset="100%" stopColor="#3a7dc9" />
                </linearGradient>
                <linearGradient id="mtnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8aaac8" />
                  <stop offset="100%" stopColor="#4a7aa8" />
                </linearGradient>
              </defs>
              <rect width="900" height="220" fill="url(#sky)" />
              <circle cx="100" cy="30" r="1" fill="white" opacity="0.6" />
              <circle cx="200" cy="20" r="1.5" fill="white" opacity="0.5" />
              <circle cx="320" cy="45" r="1" fill="white" opacity="0.7" />
              <circle cx="450" cy="15" r="1" fill="white" opacity="0.4" />
              <circle cx="600" cy="35" r="1.5" fill="white" opacity="0.6" />
              <circle cx="700" cy="25" r="1" fill="white" opacity="0.5" />
              <polygon points="0,220 80,80 160,220" fill="#3a6a9a" opacity="0.5" />
              <polygon points="60,220 180,60 300,220" fill="#2d5580" opacity="0.6" />
              <polygon points="200,220 350,40 500,220" fill="url(#mtnGrad)" opacity="0.8" />
              <polygon points="400,220 520,75 640,220" fill="#2a5080" opacity="0.65" />
              <polygon points="550,220 700,50 850,220" fill="#3a6a9a" opacity="0.7" />
              <polygon points="750,220 900,90 900,220" fill="#2d5580" opacity="0.5" />
              <polygon points="350,40 320,80 380,80" fill="white" opacity="0.9" />
              <polygon points="700,50 675,85 725,85" fill="white" opacity="0.8" />
              <polygon points="180,60 162,90 198,90" fill="white" opacity="0.7" />
              <g transform="translate(495,115)" opacity="0.9">
                <circle cx="0" cy="-14" r="4" fill="#d04020" />
                <line x1="0" y1="-10" x2="0" y2="2" stroke="#d04020" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="0" y1="-6" x2="-7" y2="-2" stroke="#d04020" strokeWidth="2" strokeLinecap="round" />
                <line x1="0" y1="-6" x2="7" y2="-2" stroke="#d04020" strokeWidth="2" strokeLinecap="round" />
                <line x1="0" y1="2" x2="-4" y2="10" stroke="#d04020" strokeWidth="2" strokeLinecap="round" />
                <line x1="0" y1="2" x2="4" y2="10" stroke="#d04020" strokeWidth="2" strokeLinecap="round" />
                <line x1="7" y1="-2" x2="14" y2="-16" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="10" y1="-16" x2="18" y2="-16" stroke="#aaa" strokeWidth="2" strokeLinecap="round" />
              </g>
              <polygon points="0,220 0,160 200,220" fill="#1d4ed8" opacity="0.7" />
              <polygon points="0,220 280,180 280,220" fill="#1e40af" opacity="0.5" />
            </svg>
            
            <button className="nav-btn nav-prev" onClick={handlePrevMonth} aria-label="Previous Month">&#8249;</button>
            <button className="nav-btn nav-next" onClick={handleNextMonth} aria-label="Next Month">&#8250;</button>
            
            <div className="hero-month-block">
              <div className="hero-year">{viewYear}</div>
              <div className="hero-month">{MONTHS[viewMonth]}</div>
            </div>
          </div>

          <div className="cal-body">
            <div className="notes-panel">
              <div className="notes-label">Notes</div>
              <div style={{ position: 'relative' }}>
                <div>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="note-line"></div>
                  ))}
                </div>
                <textarea
                  className="notes-textarea"
                  placeholder="Monthly notes..."
                  value={notes[getKey()] || ''}
                  onChange={(e) => setNotes({ ...notes, [getKey()]: e.target.value })}
                ></textarea>
              </div>
              
              <div className="range-note">
                <div className="range-note-label">Selection</div>
                <div className="range-display">
                  {getRangeDisplayText()}
                </div>
              </div>
              
              <div className="theme-row">
                <button className={`theme-pill ${theme === '' ? 'active' : ''}`} onClick={() => setTheme('')}>Alpine</button>
                <button className={`theme-pill ${theme === 'theme-forest' ? 'active' : ''}`} onClick={() => setTheme('theme-forest')}>Forest</button>
                <button className={`theme-pill ${theme === 'theme-autumn' ? 'active' : ''}`} onClick={() => setTheme('theme-autumn')}>Autumn</button>
                <button className={`theme-pill ${theme === 'theme-night' ? 'active' : ''}`} onClick={() => setTheme('theme-night')}>Night</button>
              </div>
            </div>

            <div className="grid-panel">
              <div className="day-headers">
                <div className="day-header">Mon</div>
                <div className="day-header">Tue</div>
                <div className="day-header">Wed</div>
                <div className="day-header">Thu</div>
                <div className="day-header">Fri</div>
                <div className="day-header weekend">Sat</div>
                <div className="day-header weekend">Sun</div>
              </div>
              
              <div className="day-grid">
                {calendarDays.map((cell) => {
                  if (cell.type === 'empty') {
                    return (
                      <div key={cell.key} className="day-cell other-month">
                        {cell.day}
                      </div>
                    );
                  }
                  
                  return (
                    <div
                      key={cell.key}
                      className={cell.classes}
                      onClick={() => handleDayClick(cell.obj)}
                      onMouseEnter={(e) => {
                        if (rangeStart && !rangeEnd) {
                          setHoveredDate(cell.obj);
                        }
                        if (cell.holiday) {
                          const rect = e.target.getBoundingClientRect();
                          setTooltip({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            name: cell.holiday.name,
                            desc: cell.holiday.desc
                          });
                        }
                      }}
                      onMouseLeave={() => {
                        if (rangeStart && !rangeEnd) {
                          setHoveredDate(null);
                        }
                        setTooltip(null);
                      }}
                    >
                      {cell.day}
                    </div>
                  );
                })}
              </div>
              
              <div className="holidays-key">
                <div className="holiday-dot"></div>
                <span>Holiday / special day</span>
              </div>
              
              <button className="clear-btn" onClick={handleClearSelection}>
                Clear selection
              </button>
            </div>
          </div>
        </div>
      </div>

      {tooltip && (
        <div 
          className="holiday-tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="tooltip-title">{tooltip.name}</div>
          <div className="tooltip-desc">{tooltip.desc}</div>
        </div>
      )}
    </div>
  );
}