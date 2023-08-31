import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three-gltf-loader';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter'; // Import STLExporter from correct path
import { OBJLoader } from 'three-obj-loader';

const ModelViewer = ({ modelUrl }) => {
  const [model, setModel] = useState(null);

  const stlExporter = new STLExporter();
  const canvasRef = useRef();
  const objLoader = new OBJLoader();

  useFrame(({ gl }) => {
    if (model) {
      const stlData = stlExporter.parse(model); // Export model to STL data
      const stlBlob = new Blob([stlData], {
        type: 'application/octet-stream',
      });

      // Use the stlBlob or do something else with it
    }
  });

  const handleLoad = (gltf) => {
    setModel(gltf.scene);
  };

  return (
    <Canvas ref={canvasRef}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <mesh>
        {modelUrl.endsWith('.glb') && (
          <primitive object={model} />
        )}
        {/* Handle STL and OBJ models */}
      </mesh>
    </Canvas>
  );
};

export default ModelViewer;
