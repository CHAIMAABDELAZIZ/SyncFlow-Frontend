import React from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Navbar';
import Card from '../components/Card';
import MapCard from '../components/MapCard';
import FlowChart from '../components/FlowChart';
import CostChart from '../components/CostChart';
import Info from '../components/info';

function Home() {
  return (

        <div className="flex-1 overflow-auto">
          <Info />
          <div className="grid grid-cols-6 gap-6 w-full">
              <div className="col-span-3">
                <Card />
              </div>
              <div className="col-span-3">
                <MapCard />
              </div>
              <div className="col-span-3 ">
                <FlowChart />
              </div>
              <div className="col-span-3">
                <CostChart />
              </div>
          </div>
        </div>

  );
}

export default Home;