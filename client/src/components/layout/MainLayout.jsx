import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flexGrow: 1, paddingBottom: '3rem' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
