# MessSync (Mess Manager)

A comprehensive React application for managing shared living spaces (messes). Track meals, expenses, rent, deposits, and members all in one place.

## Features

- **Authentication & Authorization**: Secure login, registration, and manager/member role separation.
- **Dashboard Overview**: Financial overview, active month summary, and recent activity at a glance.
- **Meal Management**: Track daily meals for all members.
- **Expense Tracking**: Categorized expenses including groceries, utilities, and home rent.
- **Member Management**: Add/remove members, view balances, and transfer manager roles.
- **Monthly Reports**: Generate comprehensive monthly settlements and PDF statements.
- **Real-time Notifications**: WebSockets-enabled notifications for all mess activities.
- **Responsive Design**: fully functional on desktop and mobile.
- **Dark Mode**: Built-in support for dark theme.

## Tech Stack

- React 19 + TypeScript
- Vite
- TailwindCSS
- React Router 7
- Axios
- Socket.IO Client
- Lucide React (Icons)
- Sonner (Toast Notifications)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_WS_URL=http://localhost:5000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Building for Production

```bash
npm run build
```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Open a Pull Request
