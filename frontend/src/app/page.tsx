// ==========================================
// ThreadFlow — Home Page (Redirect)
// ==========================================

import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
}
