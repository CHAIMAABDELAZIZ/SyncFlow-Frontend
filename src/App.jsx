import './App.css';
import AuthIngnr from './pages/AuthIngnr';
import Dashboard from './components/Wells';
import Alerts from './components/alerts';
import SubmitReport from './components/SubmitReport';
import Layout from './components/Layout';
import Reports from './pages/Reports';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SubmitProvisional from './components/SubmitProvisional';
import Home from './pages/Home';
import Engineers from './components/Engineers';
import PrvsReport from './pages/PrvsReport';
import WellDetail from './pages/WellDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthIngnr />} />
        
        {/* Protected layout with navbar */}
        <Route element={<Layout />}>
          <Route path="/Wells" element={<Dashboard />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/engineers" element={<Engineers />} />
          <Route path="/submit-report" element={<SubmitReport />} />
          <Route path="/submit-provisional" element={<SubmitProvisional />} />
          <Route path="/home" element={<WellDetail/>} /> 
          {/* <PrvsReport/>  <Reports/> <Home /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;