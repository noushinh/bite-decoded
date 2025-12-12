import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import sampleLocations from './data/locations';
import { Routes, Route } from 'react-router-dom';
import WhatsInYourFood from './pages/WhatsInYourFood';

function MainLayout() {
  const [locations] = useState(sampleLocations);
  const [selected, setSelected] = useState(null);

  return (
    <div className="App">
      <div className="panels" role="region" aria-label="Main panels">
        <section className="panel" aria-labelledby="panel-a">
          {/* Keep Sidebar component inside the left panel */}
          <Sidebar locations={locations} onSelect={setSelected} />
        </section>

        <section className="panel map-panel">
          <div className="map-wrapper">
            <Map locations={locations} selectedLocation={selected} />
          </div>
        </section>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/whats-in-your-food" element={<WhatsInYourFood />} />
    </Routes>
  );
}

export default App;
