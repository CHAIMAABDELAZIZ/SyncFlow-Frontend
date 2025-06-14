import './App.css';
import AuthIngnr from './pages/AuthIngnr';
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import Engineers from './pages/Engineers';
import SubmitReport from './components/SubmitReport';
import Layout from './components/Layout';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SubmitProvisional from './components/SubmitProvisional';
import Home from './pages/Home';
import AddWell from './pages/AddWell';
import AddUser from './pages/adduser';
import PrvsReport from './pages/PrvsReport';
import Reports from './pages/Reports';
import WellDetail from './pages/WellDetail'; 
import DailyReport from './pages/DailyReport';
import Detailprvsreport from './pages/detailprvsreport';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthIngnr />} />
        
        {/* Protected layout with navbar */}
        <Route element={<Layout />}>
        <Route path="/auth" element={<AuthIngnr />} />  
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/submit-report" element={<SubmitReport />} />
          <Route path="/submit-provisional" element={<SubmitProvisional />} />
          <Route path="/home" element={<Home />} />
          <Route path="/addwell" element={<AddWell />} />
          <Route path="/adduser" element={<AddUser />} />
          <Route path="/engineers" element={<Engineers />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/welldetails/:id" element={<WellDetail />} /> 
          <Route path="/well/:id/add-daily-report" element={<DailyReport />} /> 
          <Route path="/well/:id/add-provisional-plan" element={<PrvsReport />} /> 
          <Route path="/provisional-report/:wellId" element={<Detailprvsreport />} /> 
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;