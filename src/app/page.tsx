import { redirect } from 'next/navigation';

export default function HomePage() {
  // The middleware will handle redirecting to /login if not authenticated
  // or to /dashboard if authenticated. We just need to trigger the middleware.
  redirect('/dashboard');
}
