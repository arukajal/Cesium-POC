// src/components/FileInput.js
import React, { useState } from 'react';

const FileInput = ({ onFileUpload }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        // Assuming content is GeoJSON data
        onFileUpload(JSON.parse(content));
      };
      reader.readAsText(file);
    }
  };

  return (
    <div>
      <input type="file" accept=".geojson" onChange={handleFileChange} />
    </div>
  );
};

export default FileInput;
