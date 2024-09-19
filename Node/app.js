const express = require('express');
const path = require('path');
const fs = require('fs');
const { google } = require('googleapis');
const axios = require('axios'); 
const app = express();
const port = 5000;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});




async function getGoogleSheetData() {
  const keys = require('./sheet-398709-f9c8c0c7b336 (1).json');
  const auth = await authorize(keys);
  const sheets = google.sheets({ version: 'v4', auth });

  const spreadsheetId = '1bWaPinnew4JNXaQsjvUO9AFrWZ34UtBfS7pn2JSPRjg';
  const range = 'Sheet1'; 

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = response.data.values;

    if (values && values.length > 0) {
      const headers = values[0];
      const data = values.slice(1); 

      const latitudeIndex = headers.indexOf('Latitude');
      const longitudeIndex = headers.indexOf('Longitude');
      const modelIndex = headers.indexOf('Model');

      if (latitudeIndex !== -1 && longitudeIndex !== -1 && modelIndex !== -1) {
        const result = data.map(row => {
          const entry = {
            latitude: parseFloat(row[latitudeIndex]),
            longitude: parseFloat(row[longitudeIndex]),
            modelUrl: row[modelIndex],
          };
          headers.forEach((header, index) => {
            if (index !== latitudeIndex && index !== longitudeIndex && index !== modelIndex) {
              entry[header] = row[index];
            }
          });
          console.log('entry', entry);
          return entry;
        });
        console.log('Data fetched from Google Sheets:', result);
        return result;
      }
    }

    return null; 
  } catch (error) {
    console.error('Error reading Google Sheets data:', error);
    return null;
  }
}

async function authorize(credentials) {
  try {
    const { client_email, private_key } = credentials;

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email,
        private_key,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    return auth.getClient();
  } catch (error) {
    console.error('Error authorizing with Google Sheets API:', error);
    return null;
  }
}

async function getElevation(latitude, longitude) {
  try {
    const apiKey = 'AIzaSyDcBiFfUwh8ktCNUlbYVRbKP4SsndesNxo'; 
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/elevation/json?locations=${latitude},${longitude}&key=${apiKey}`
    );

    const elevation = response.data.results[0].elevation;
    return elevation;
  } catch (error) {
    console.error('Error fetching elevation data:', error);
    return null;
  }
}

async function getGoogleSheetDataWithElevation(req) { 
  const data = await getGoogleSheetData();

  if (data) {
    const modelBaseUrl = `http://${req.headers.host}/model`;

    const dataWithElevation = [];
    for (const entry of data) {
      const elevation = await getElevation(entry.latitude, entry.longitude);
      if (elevation !== null) {
        dataWithElevation.push({
          ...entry,
          elevation: elevation,
          modelPath: `${modelBaseUrl}/${encodeURIComponent(entry.modelUrl)}`,
        });
      }
    }

    console.log('Data with elevation:', dataWithElevation);
    return dataWithElevation;
  } else {
    return null;
  }
}



app.get('/test', (req, res) => {
  console.log('Test route accessed.');
  res.send('Test route response.');
});

app.get('/model/:modelName', (req, res) => {
  const modelName = req.params.modelName;

  const sanitizedModelName = modelName.replace(/\\/g, '/');
  const encodedModelName = encodeURIComponent(sanitizedModelName);

  const modelFilePath = path.join(__dirname, 'models', sanitizedModelName);

  console.log('Model file path:', modelFilePath);

  if (fs.existsSync(modelFilePath)) {
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodedModelName}"`);

    console.log('Model file exists.');

    const fileStream = fs.createReadStream(modelFilePath);
    fileStream.pipe(res);
  } else {
    console.error('Model file not found.');

    res.status(404).send('File not found');
  }
});


app.use('/models', express.static(path.join(__dirname, 'models')));

app.get('/data', async (req, res) => {
  const dataWithElevation = await getGoogleSheetDataWithElevation(req);
  const dataWithModelPath = await getGoogleSheetData();

  if (dataWithElevation && dataWithModelPath) {
    const modelBaseUrl = `http://${req.headers.host}/model`;

    const modelPathMap = {};
    dataWithModelPath.forEach(modelEntry => {
      const key = `${modelEntry.latitude.toFixed(4)}-${modelEntry.longitude.toFixed(4)}`;
      modelPathMap[key] = modelEntry.modelPath;
    });

    const combinedData = dataWithElevation.map(elevationEntry => {
      const key = `${elevationEntry.latitude.toFixed(4)}-${elevationEntry.longitude.toFixed(4)}`;
      const modelPath = modelPathMap[key];

      if (modelPath) {
        return {
          ...elevationEntry,
          modelPath: modelPath,
        };
      }

      return elevationEntry;
    });

    console.log('Combined data with elevation and modelPath:', combinedData);
    res.json(combinedData);
  } else {
    res.status(500).send('Error fetching data from Google Sheets or calculating elevation.');
  }
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
