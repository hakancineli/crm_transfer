import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminLoginClient from './AdminLoginClient';

export default function AdminLoginPage() {
  const host = headers().get('host') || '';
  if (host.includes('protransfer.com.tr')) {
    redirect('/protransfer');
  }
  return <AdminLoginClient />;
}