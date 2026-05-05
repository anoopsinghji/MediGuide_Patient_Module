import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import SiteFooter from './SiteFooter';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <Outlet />
      <SiteFooter />
    </div>
  );
}
