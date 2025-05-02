# Weekly Activity Schedule

## Project Overview

The Weekly Activity Schedule is a browser-based scheduling and attendance management system designed for use in day programs, educational settings, or any structured environment where individual weekly plans and participation must be tracked. This application allows for employee creation, weekly schedule assignment, attendance logging, and full PDF export — all executed entirely in the browser with no backend required.

**Live Demo:**  
https://weeklyschedulemaker.netlify.app/

> **Note:** This application uses `localStorage` for all data persistence. It is intended as a demonstration tool and is not suitable for storing personally identifiable information (PII) or for use in production environments involving sensitive data.

---

## Key Features

- Add and manage employee profiles
- Customize daily schedules across Monday through Friday
- Assign specific time blocks with editable or fixed activity slots
- Track daily attendance per employee and record client interactions
- Export full weekly schedules and attendance logs as a printable PDF
- Dashboard overview displaying all employee data
- Mobile-responsive interface with accessible design

---

## Application Structure

### Home Page (`index.html` / `index.js`)

- Allows users to create or remove employees
- Employee list rendered as dynamic cards with avatars and action buttons
- Integrated search field for filtering by name
- Navigation to individual schedule pages and the dashboard

### Schedule Page (`schedule.html` / `schedule.js`)

- Provides per-employee weekly activity blocks with editable areas
- Fixed events (e.g., Morning Meeting, Lunch) are prepopulated and locked
- Attendance section captures daily participation by client name
- Full PDF export functionality with dynamic scaling and print layout

### Dashboard View (`dashboard.html` / `dashboard.js`)

- Summarized, read-only view of each employee's schedule and attendance
- Aggregates localStorage data for centralized review

### Styling (`styles.css`)

- Utilizes Flexbox and CSS Grid for layout
- Responsive breakpoints for tablet and mobile compatibility
- Modular design system with reusable button classes, modals, and tooltips

---

## Data Storage

All data in this application is stored locally in the browser using the Web Storage API (`localStorage`). Keys are structured as follows:

- `employees` — master list of employee names
- `schedule_{employee}` — per-user weekly schedule data
- `attendance_{employee}` — per-user attendance tracking

There is no backend server, no database, and no cloud integration.

---

## Setup Instructions

No installation is required. To run the application locally:

1. Clone or download the repository.
2. Open `index.html` in any modern web browser.
3. Begin by creating employee records and assigning their schedules.

---

## Limitations

- This tool is designed for prototype and demonstration purposes only.
- It does not encrypt or protect stored data.
- All data is cleared if browser storage is reset or accessed from another device.

---

## License

This project is licensed under the **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License (CC BY-NC-ND 4.0)**.

You may:

- Copy and redistribute the material in any medium or format

Under the following terms:

- **Attribution** — Credit must be given to the original creator.
- **NonCommercial** — Use for commercial purposes is prohibited.
- **NoDerivatives** — If you remix, transform, or build upon the material, you may not distribute the modified material.

Full license text: https://creativecommons.org/licenses/by-nc-nd/4.0/

---

## Live Deployed Demonstration

For demonstration purposes only.  
Live deployment: https://weeklyschedulemaker.netlify.app/
