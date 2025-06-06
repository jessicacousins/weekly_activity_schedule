# Weekly Activity Schedule

## Project Overview

The Weekly Activity Schedule is a lightweight, browser-based scheduling and attendance tracking system. It is built for environments like day programs, care teams, or education providers that require flexible, client-focused planning tools. All logic is handled client-side with no backend server involved.

**Live Demo:**  
https://weeklyschedulemaker.netlify.app/

> **Note:** This prototype uses `localStorage` only. It is not secure and should not be used to store sensitive or personally identifiable information.

---

## Key Features

- Create and manage individual employee profiles
- Assign custom weekly schedules (editable per day and time block)
- Track attendance with client-specific notes
- Export weekly schedules and logs to print-ready PDFs
- View overall trends via a dashboard with summaries and top client stats
- Fully responsive UI with accessible styling

---

## Application Structure

### Home Page (`index.html` / `index.js`)

- Employee list with avatars, action controls, and live search
- Create/delete employee profiles
- Route to schedule or dashboard views

### Schedule Page (`schedule.html` / `schedule.js`)

- Provides per-employee weekly activity blocks with editable areas
- Fixed events (e.g., Morning Meeting, Lunch) are prepopulated and locked
- Log attendance and attach per-client comments
- Full PDF export with responsive print layout

### Dashboard View (`dashboard.html` / `dashboard.js`)

- Centralized summary of all schedule and attendance data
- Real-time heatmap, totals, and employee breakdown

### Styling (`styles.css`)

- Dark UI theme using Flexbox and Grid
- Device-adaptive layout for desktop, tablet, mobile
- Interactive elements with smooth transitions
- Modular design system with reusable button classes, modals, and tooltips

---

## Data Storage

All application data is stored using the Web Storage API (`localStorage`). No backend or external database is used. Storage keys are structured as:

- `employees` — list of employees
- `schedule_{employee}` — weekly schedule
- `attendance_{employee}` — attendance logs
- `comment_{employee}_{date}` — per-day client comments

Data is tied to the current browser/device and is cleared when storage is wiped or accessed elsewhere.

---

## Setup Instructions

1. Download or clone this repository
2. Open `index.html` in any modern browser (Chrome, Firefox, Safari, etc.)
3. Start adding employees and assigning schedules

> No installation, dependencies, or account sign-in required.

---

## Limitations

- Prototype only; not built for real-world deployment
- Data is not encrypted or synced between devices
- Local storage can be cleared manually or by browser settings
- Not suitable for storing client PII or sensitive health records

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
