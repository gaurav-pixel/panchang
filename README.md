# Interactive React Wall Calendar

A beautiful, responsive, and highly interactive wall calendar built with React. It features date range selection, customizable themes, persistent monthly notes, and dynamic holiday tooltips.

## Features

* **Interactive Date Selection:** Click to select a start date, click again to select an end date. The range highlights dynamically.
* **Theming Engine:** Four distinct visual themes (Alpine, Forest, Autumn, Night) that instantly change the CSS variables for a fresh look.
* **Persistent Notes:** A monthly notes area that automatically saves to `localStorage`.
* **Dynamic Grid:** Automatically calculates days, leap years, and pads the grid with previous/next month days.
* **Holiday Tooltips:** Hover over marked dates to see details about specific holidays or special days.
* **Fully Responsive:** Adapts to mobile and desktop screens seamlessly.

## Tech Stack

* React (Hooks: `useState`, `useEffect`, `useMemo`)
* Pure CSS (Custom Properties/Variables)
* SVG for vector hero graphics

## Installation

1. Create a new React project (using Vite or Create React App):
   ```bash
   npm create vite@latest calendar-app -- --template react
   cd calendar-app
   npm install

## Customization
To add or modify holidays, update the HOLIDAYS object at the top of App.jsx:
const HOLIDAYS = {
  'MonthIndex-Day': { name: "Holiday Name", desc: "Description here" },
  // Example: October 31st (Month index 9)
  '9-31': { name: "Halloween", desc: "Spooky season!" }
};
