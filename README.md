# Reints Office - Internal Dashboard

This project is an internal dashboard application called "Reints Office", built with Next.js 15. It provides functionalities for managing orders, products, customers, and potentially other internal tasks.

## Project Structure

The project follows the standard Next.js App Router structure:

```
app/
  layout.js             # Root layout (includes SessionProvider wrapper)
  page.js               # Root page (often redirects or basic landing)
  providers.js          # Client component wrapper for Context/Session providers
  globals.css           # Global styles

  dashboard/            # Protected dashboard area
    layout.jsx          # Dashboard layout (with Sidebar and Header)
    page.jsx            # Dashboard overview page
    orders/             # Order management routes
    products/           # Product management routes
    customers/          # Customer management routes
    tasks/              # Task management routes
    # settings/         # Potential future settings routes

  login/                # Login page route
    page.js             # The login page component

  api/                  # API routes
    auth/               # NextAuth.js authentication routes
      [...nextauth]/route.js # NextAuth.js handler
    ai/                 # AI-related API routes (e.g., for TodoCreator)
    customers/          # Customer-related API routes
    # Other API routes for orders, products, etc. might exist here

  lib/                  # Server-side libraries/utilities (not directly routable)
    data-service.js     # Functions for interacting with the database (Supabase)
    supabase.js         # Supabase client initialization
    utils.js            # General utility functions

  components/
    ui/                 # Shadcn/UI generated components (Button, Card, etc.)
    ai/                 # AI-related components (e.g., TodoCreator)
    header.jsx          # Header component
    sidebar.jsx         # Sidebar component
    # Other reusable application components (forms, tables, dialogs, etc.)

  actions/              # Server Actions (if used)

public/
  # Static assets (images, fonts, etc.)

middleware.js           # Next.js middleware (for route protection)
.env.local              # Environment variables (Supabase keys, AUTH_SECRET, etc.)
next.config.mjs         # Next.js configuration
package.json            # Project dependencies and scripts
README.md               # This file
```

## Technologies Used

- **Framework:** [Next.js](https://nextjs.org/) (v15, App Router)
- **UI Library:** [React](https://reactjs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [Shadcn/UI](https://ui.shadcn.com/) (likely, based on `components/ui/card`)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Language:** JavaScript
- **Animation:** [Framer Motion](https://www.framer.com/motion/) (as per project setup)

## Database

- **Platform:** [Supabase](https://supabase.com/)
- **Underlying Database:** [PostgreSQL](https://www.postgresql.org/)
- **Client Library:** `@supabase/supabase-js`
- **Usage:** Used for data fetching (products, customers, orders) and storing application data.
- **Configuration:** Connection details are managed via environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in `lib/supabase.js`.

## Authentication

Authentication is handled using **NextAuth.js (v4)** to protect the dashboard and manage user sessions.

- **Library:** `next-auth@^4.24.11`
- **Strategy:** Credentials Provider
- **User Storage:** Credentials for a small, fixed set of users (currently 3) are stored directly in environment variables (`.env.local`) like `USER1_NAME`, `USER1_PASSWORD`, etc.
- **API Handler:** The NextAuth.js API route is located at `app/api/auth/[...nextauth]/route.js`. It uses the JWT session strategy and includes callbacks to add user ID to the session.
- **Login Page:** A custom login page is implemented at `app/login/page.js` using Shadcn/UI components.
- **Route Protection:** Next.js Middleware (`middleware.js`) intercepts requests. It checks for the presence of the `next-auth.session-token` (or `__Secure-next-auth.session-token`) cookie. Unauthenticated users attempting to access protected routes (like `/dashboard/*`) are redirected to `/login`.
- **Session Access:**
  - **Client Components:** Use `signIn`, `signOut` from `next-auth/react`. The `useSession` hook can also be used if needed.
  - **Server Components:** Use `getServerSession(authOptions)` from `next-auth/next` to retrieve session data (as seen in `app/dashboard/page.jsx`).
- **Logout:** Implemented in the `components/header.jsx` component using the `signOut` function.
- **Configuration:** Requires `AUTH_SECRET` and user credentials in `.env.local`.
