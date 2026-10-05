import '@/frontend/styles/admin.css';
import { AdminSession } from '@/frontend/components/admin/admin-session';
export default function AdminLayout({children}:{children:React.ReactNode}) {
  return <div className="cms-shell"><AdminSession>{children}</AdminSession></div>;
}
