import { Outlet } from 'react-router-dom';
import ClientHeader from '../components/Header/ClientHeader';
import ClientFooter from '../components/Footer/ClientFooter';
import './ClientLayout.css';

const ClientLayout = () => {
  return (
    <div className="client-layout">
      <ClientHeader />
      <div className="client-content">
        <Outlet />
      </div>
      <ClientFooter />
    </div>
  );
};

export default ClientLayout;
