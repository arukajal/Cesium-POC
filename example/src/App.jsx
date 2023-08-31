// src/App.jsx
import  { useState } from 'react';
import ModelViewer from './/components/ModalViewer'
import CesiumViewer from './/components/CesiumViewer';

function App() {
  const [modelUrl, setModelUrl] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setModelUrl(content);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="app-container">
      <div className="file-input">
        <input type="file" accept=".glb, .stl, .obj" onChange={handleFileUpload} />
      </div>
      <div className="viewer-container">
        <CesiumViewer />
        <div className="model-viewer">
          {modelUrl && <ModelViewer modelUrl={modelUrl} />}
        </div>
      </div>
    </div>
  );
}

export default App;
