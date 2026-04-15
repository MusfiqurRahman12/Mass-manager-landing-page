# MessSync - Mess Management Application

A modern, responsive React web application for managing shared living spaces (messes) with real-time features, meal tracking, expense management, and more.

## Tech Stack

- **Frontend**: React 19.2.4 with TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Build Tool**: Vite 8
- **Routing**: React Router v7
- **State Management**: Context API + Zustand patterns
- **API Client**: Axios
- **Real-time**: Socket.IO
- **Form Management**: React Hook Form + Zod validation
- **Date Handling**: date-fns
- **Notifications**: Sonner
- **Icons**: Lucide React

## Features

### For Members

- ✅ Dashboard with personal meal and deposit info
- ✅ Meal entry and tracking
- ✅ View monthly expenses
- ✅ Deposit history
- ✅ Real-time chat with mess members
- ✅ PDF statement download
- ✅ Push and in-app notifications
- ✅ Dark/Light theme toggle

### For Managers

- ✅ All member features
- ✅ Member management (add/remove)
- ✅ Expense management and categorization
- ✅ Meal cost configuration
- ✅ Monthly cycle management
- ✅ Manager transfer functionality
- ✅ Comprehensive reports and analytics
- ✅ Settings for market day configuration

## Project Structure

```
src/
├── components/
│   ├── common/              # Reusable UI components (Button, Input, Card, etc.)
│   ├── layout/              # Navigation and layout (Navbar, Sidebar, Footer)
│   ├── auth/                # Authentication components
│   ├── dashboard/           # Dashboard components
│   ├── members/             # Member management
│   ├── meals/               # Meal entry and tracking
│   ├── expenses/            # Expense management
│   ├── deposits/            # Deposit tracking
│   ├── months/              # Month management
│   ├── chat/                # Messaging UI
│   ├── notifications/       # Notifications UI
│   ├── settings/            # Settings components
│   └── reports/             # Reports and PDF generation
├── pages/                   # Route pages
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   └── ...
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useAsyncuseAsync.ts
│   ├── useForm.ts
│   ├── useStorage.ts
│   ├── useWebSocket.ts
│   └── useUtils.ts
├── services/                # API calls and integrations
│   ├── apiClient.ts         # Axios instance
│   ├── authService.ts
│   ├── messService.ts
│   ├── memberService.ts
│   ├── mealService.ts
│   ├── expenseService.ts
│   ├── depositService.ts
│   ├── monthService.ts
│   ├── chatService.ts
│   ├── notificationService.ts
│   ├── transferService.ts
│   └── pdfService.ts
├── context/                 # Context providers
│   ├── AuthContext.tsx
│   ├── SocketContext.tsx
│   ├── ThemeContext.tsx
│   └── index.ts
├── utils/                   # Utility functions
│   ├── cn.utils.ts          # Tailwind class merging
│   ├── date.utils.ts        # Date formatting
│   ├── format.utils.ts      # Number and text formatting
│   ├── validation.utils.ts  # Form validation
│   └── index.ts
├── App.tsx                  # Main app with routing
├── main.tsx                 # React entry point
├── index.css                # Global styles & Tailwind
└── assets/                  # Static assets
```

## Installation & Setup

### Prerequisites

- Node.js 22+ and npm

### Steps

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**
   Copy `.env.example` to `.env` and update with your API endpoints:

   ```bash
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_WS_URL=http://localhost:3000
   VITE_APP_NAME=Mess Manager
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

   App will be available at `http://localhost:5173`

4. **Build for production**

   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## API Integration

The application expects the following endpoints from your backend:

### Authentication

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/create-mess` - Create new mess
- `POST /auth/join-mess` - Join existing mess

### Mess Management

- `GET /mess` - Get mess details
- `PUT /mess` - Update mess info
- `DELETE /mess` - Delete mess

### Members

- `GET /members` - List members
- `POST /members` - Add member
- `DELETE /members/{id}` - Remove member
- `PUT /members/{id}/role` - Change member role

### Meals

- `GET /meals` - List meals
- `POST /meals` - Add meal entry
- `DELETE /meals/{id}` - Delete meal

### Expenses

- `GET /expenses` - List expenses
- `POST /expenses` - Add expense
- `PUT /expenses/{id}` - Update expense
- `DELETE /expenses/{id}` - Delete expense

### Deposits

- `GET /deposits` - List deposits
- `POST /deposits` - Add deposit
- `DELETE /deposits/{id}` - Delete deposit

### Months

- `GET /months/active` - Get active month
- `POST /months/start` - Start new month
- `GET /months/history` - Get month history
- `GET /months/{id}` - Get month details

### Chat & Notifications

- `GET /chat/messages` - Get messages
- `POST /chat/messages` - Send message
- `GET /notifications` - Get notifications
- `PATCH /notifications/{id}/read` - Mark as read

### WebSocket

- `/ws/chat/{messId}` - Real-time chat and notifications

## Key Components Guide

### Common Components

- `Button` - Primary CTA button with variants
- `Input` - Form input with error handling
- `Card` - Content container
- `Alert` - Alert messages
- `Badge` - Status badges
- `Skeleton` - Loading states

### Context Providers

- `AuthProvider` - Manages authentication state
- `SocketProvider` - Manages WebSocket connections
- `ThemeProvider` - Manages dark/light theme

### Hooks

- `useAuth()` - Access authentication
- `useSocket()` - Access WebSocket connection
- `useForm()` - Handle form state
- `useAsync()` - Handle async operations
- `useStorage()` - Manage local/session storage

## Styling

The app uses Tailwind CSS with custom components:

### Components Classes

- `.btn-primary`, `.btn-secondary`, `.btn-ghost` - Button variants
- `.card` - Card container
- `.input-field` - Input styling
- `.badge`, `.badge-primary`, etc. - Badge styles
- `.spinner` - Loading spinner

### Theme

- Light theme (default)
- Dark theme (via toggle)
- Responsive design with mobile-first approach

## Deployment

### Production Build

```bash
npm run build
```

Creates optimized build in `dist/` folder

### Hosting Options

- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Environment for Production

```
VITE_API_BASE_URL=https://your-api.com/api
VITE_WS_URL=https://your-api.com
```

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Create components in appropriate folders
4. Add proper JSDoc comments
5. Test responsive design

## License

MIT License - feel free to use this project!

## Support

For issues or questions, please open an issue or contact the development team.
