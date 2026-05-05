import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

export default function ProtectedLayout() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/consultation/');

  return (
    <>
      {!hideNavbar ? <Navbar /> : null}
      <Outlet />
    </>
  );
}
