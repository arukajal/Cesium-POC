// src/components/CesiumMap.js
import React from 'react';
import { Viewer, GeoJsonDataSource } from 'cesium';

const CesiumMap = ({ geojsonData }) => {
  const cesiumContainerRef = React.useRef(null);

  React.useEffect(() => {
    const viewer = new Viewer(cesiumContainerRef.current);
    const dataSource = new GeoJsonDataSource();
    dataSource.load(geojsonData);
    viewer.dataSources.add(dataSource);

    return () => {
      viewer.dataSources.remove(dataSource);
      viewer.destroy();
    };
  }, [geojsonData]);

  return <div ref={cesiumContainerRef} style={{ height: '500px' }} />;
};

export default CesiumMap;
