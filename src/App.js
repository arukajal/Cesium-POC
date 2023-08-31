// src/App.js
import React, { useState } from 'react';
import FileInput from './components/FileInput';
import CesiumMap from './components/CesiumMap';

function App() {
  const [geojsonData, setGeojsonData] = useState(null);

  const handleFileUpload = (data) => {
    setGeojsonData(data);
  };

  return (
    <div>
      <h1>Cesium File App</h1>
      <FileInput onFileUpload={handleFileUpload} />
      {geojsonData && <CesiumMap geojsonData={geojsonData} />}
    </div>
  );
}

export default App;
