# Reints Office - Internal Dashboard

This project is an internal dashboard application called "Reints Office", built with Next.js 15. It provides functionalities for managing orders, products, customers, and potentially other internal tasks.

## Project Structure

The project follows the standard Next.js App Router structure:

```
app/                  # Main application routes, layouts, and pages
  layout.js           # Root layout
  page.js             # Root page
  dashboard/          # Dashboard specific routes and layout
    layout.jsx
    page.jsx
    orders/
    products/
    customers/
    settings/
  components/         # Reusable React components (e.g., Sidebar, Header, Cards)
  lib/                # Utility functions, data fetching logic (e.g., data-service.js)
  styles/             # Global styles or Tailwind configuration
public/               # Static assets (images, fonts, etc.)
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
