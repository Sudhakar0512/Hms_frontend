# Quick Start Guide

## Error Fixes Applied

✅ **Fixed**: Error handling for when backend is not running
✅ **Fixed**: TypeScript import issues
✅ **Fixed**: Undefined state errors when API calls fail

## Running the Application

### 1. Start the Backend (Spring Boot)

```bash
cd /home/sudhakar-appxcess/own/java/hms
./mvnw spring-boot:run
```

Or if you're using an IDE, run the `HmsApplication.java` class.

The backend should start on `http://localhost:8080`

### 2. Start the Frontend (React)

```bash
cd /home/sudhakar-appxcess/own/java/hms-frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### 3. Access the Application

Open your browser and navigate to: `http://localhost:5173`

## Error Messages

If you see connection errors:
- **Check**: Backend is running on port 8080
- **Check**: Backend CORS is configured (already done - includes port 5173)
- **Action**: Click the "Retry" button in the error message

## Features Available

1. **Dashboard** - View statistics and overview
2. **Patients** - Manage patient records (CRUD operations)
3. **Rooms** - Manage hospital rooms (CRUD operations)
4. **Allocations** - Allocate rooms to patients, transfer, discharge

## Troubleshooting

### Backend Not Starting
- Check if port 8080 is already in use
- Verify Java and Maven are installed
- Check database configuration in `application.properties`

### Frontend Not Connecting
- Verify backend is running
- Check browser console for CORS errors
- Verify API URL in `.env` file (defaults to `http://localhost:8080/api`)

### TypeScript Errors
- Run `npm install` to ensure all dependencies are installed
- Clear cache: `rm -rf node_modules/.vite`
- Restart the dev server

## Next Steps

1. Start the backend server
2. Start the frontend server
3. Open the application in your browser
4. The UI will show a friendly error message if the backend is not running
5. Once backend is running, click "Retry" or refresh the page
