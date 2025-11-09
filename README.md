# HMS Frontend - Hospital Management System

A modern, professional React frontend application for the Hospital Management System.

## Features

- 🏥 **Patient Management** - Create, read, update, and delete patient records
- 🏠 **Room Management** - Manage hospital rooms with filtering and search
- 📅 **Room Allocation** - Allocate rooms to patients, transfer, and discharge
- 📊 **Dashboard** - Real-time statistics and overview
- 🎨 **Modern UI** - Professional design with Tailwind CSS
- 📱 **Responsive** - Works on all device sizes

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons

## Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8080`

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (optional, defaults to `http://localhost:8080/api`):
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Open your browser and navigate to `http://localhost:5173`

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/
│   ├── Allocations/    # Room allocation components
│   ├── Dashboard/      # Dashboard component
│   ├── Layout/         # Layout components (Sidebar, Header)
│   ├── Patients/       # Patient management components
│   ├── Rooms/          # Room management components
│   └── Shared/         # Shared components (Modal, Button, Table)
├── config/
│   └── api.ts          # API configuration
├── services/
│   ├── allocationService.ts
│   ├── patientService.ts
│   └── roomService.ts
├── types/
│   └── index.ts        # TypeScript types and interfaces
└── App.tsx             # Main app component with routing
```

## API Integration

The frontend communicates with the Spring Boot backend API. Make sure the backend is running on `http://localhost:8080` (or update the `.env` file with the correct URL).

### Endpoints Used

- **Patients**: `/api/patients`
- **Rooms**: `/api/rooms`
- **Allocations**: `/api/allocations`

## Features Overview

### Dashboard
- View total patients, available rooms, active allocations, and total rooms
- Real-time statistics

### Patient Management
- Create new patients
- View patient list with pagination
- Search patients by name, email, or phone
- Edit patient details
- View patient details
- Delete patients

### Room Management
- Create new rooms
- View room list with pagination
- Filter by status (Available, Occupied, Maintenance, Reserved)
- Filter by room type (Single, Double, Triple, Suite, ICU, etc.)
- Edit room details
- View room details
- Delete rooms

### Room Allocation
- Allocate rooms to patients
- View all allocations
- Filter active allocations
- Transfer patients to different rooms
- Discharge patients
- Cancel allocations
- View allocation details

## Development

### Adding New Features

1. Create components in the appropriate directory
2. Add types in `src/types/index.ts`
3. Add API services in `src/services/`
4. Update routes in `src/App.tsx`

### Styling

The project uses Tailwind CSS for styling. Customize colors and themes in `tailwind.config.js`.

## Troubleshooting

### CORS Issues
Make sure the backend has CORS configured to allow requests from `http://localhost:5173`.

### API Connection Issues
- Verify the backend is running
- Check the `VITE_API_BASE_URL` in `.env`
- Check browser console for errors

## License

MIT