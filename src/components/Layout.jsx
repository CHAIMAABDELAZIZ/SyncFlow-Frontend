import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
  return (
    <div className="flex h-screen">
      {/* Sidebar à gauche */}
      <Sidebar />

      {/* Contenu principal à droite */}
      <div className="flex flex-col flex-1">
        {/* Navbar en haut */}
        <Navbar />

        {/* Zone principale */}
        <main className="p-4 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
