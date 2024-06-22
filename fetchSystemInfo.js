const express = require('express');
const app = express();
const path = require('path');
const si = require('systeminformation');
const bodyParser = require('body-parser'); 
const mongoose = require('mongoose');
const SystemInfo = require('./models/SystemInfo'); // Ensure this path is correct


const port = 5000;
const axios = require('axios');
const arp = require('node-arp');

app.use(bodyParser.json());

const dbURI = 'mongodb+srv://vp0072003:Starwar007@blog.euwyrii.mongodb.net/bitbox?retryWrites=true&w=majority';
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
    })
    .catch((err) => {
        console.error('Database connection error:', err);
    });

// Serve static files (e.g., index.html) from the 'public' directory
app.use(express.static('public'));
app.post('/system-info', async (req, res) => {
    try {
       const { manufacturer, Model, Serial_Number, ipAdd } = req.body;
       console.log(Model);

        if (!manufacturer || !Model || !Serial_Number || !ipAdd) {
            return res.status(400).send('All fields are required');
        }
         
        // Find an existing entry with the same ipAdd and update it, or create a new entry if it doesn't exist
        const existingSystemInfo = await SystemInfo.findOneAndUpdate(
            { ipAdd },
            { manufacturer, Model, Serial_Number, ipAdd },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        
        
        // Save systemInfo to session
        // req.session.systemInfo = systemInfo;
        
        res.status(200).send('System information fetched successfully');
    } catch (error) {
        console.error('Error saving system information:', error);
        res.status(500).send('Error saving system information');
    }
});
app.get('/getdata', async (req, res) => {
    try {
        const system = await si.chassis();
        const system2 = await si.system();
        const ipAddressResponse = await axios.get('https://api.ipify.org?format=json');
        const ipAddress = ipAddressResponse.data.ip;

        const systemInfo = {
            manufacturer: system.manufacturer || "N/A",
            Model: system2.model,
            Serial_Number: system.assetTag || "N/A",
            ipAdd: ipAddress
        };

        res.status(200).json(systemInfo);
    } catch (error) {
        console.error('Error calculating system information:', error);
        res.status(500).send('Error calculating system information');
    }
});


// Define a route for the root URL '/'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '', 'index.html'));
});

// Start the server on port 5000
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});