import './dashboard.css';
import { AdminSession } from '@/components/admin/admin-session';
export default function AdminLayout({children}:{children:React.ReactNode}) {
  return <div className="cms-shell"><AdminSession>{children}</AdminSession></div>;
}
