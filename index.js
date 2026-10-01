const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

const readline = require('readline');

// Spawn the C Backend Process
let cBackend;
let rl;
try {
    cBackend = spawn(path.join(__dirname, '../backend.exe'));
    rl = readline.createInterface({
        input: cBackend.stdout,
        terminal: false
    });
    console.log("C Backend Process started successfully.");
} catch (e) {
    console.error("Failed to start C Backend. Did you compile backend.c to backend.exe?");
}

// Helper to send a command to the C process and wait for the JSON response
function sendCommandToC(command) {
    return new Promise((resolve, reject) => {
        if (!cBackend || cBackend.killed) {
            return reject(new Error("C Backend is not running. Please compile backend.c"));
        }

        const onLine = (line) => {
            rl.removeListener('line', onLine);
            try {
                resolve(JSON.parse(line));
            } catch (e) {
                resolve(line); 
            }
        };

        rl.on('line', onLine);
        
        // Send command to C stdin
        cBackend.stdin.write(command + '\n');
    });
}

// GET: View the entire Queue
app.get('/api/queue', async (req, res) => {
    try {
        const queueData = await sendCommandToC("GET_QUEUE");
        // The C program returns JSON array natively!
        res.type('json').send(queueData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST: Enqueue a new patient
app.post('/api/enqueue', async (req, res) => {
    const { name, issue } = req.body;
    if (!name || !issue) {
        return res.status(400).json({ error: 'Name and issue are required' });
    }
    
    try {
        // Send format: ENQUEUE Name|Issue
        const response = await sendCommandToC(`ENQUEUE ${name}|${issue}`);
        res.status(201).json(response);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST: Dequeue the next patient
app.post('/api/dequeue', async (req, res) => {
    try {
        const response = await sendCommandToC("DEQUEUE");
        if (response.status === 'error') {
            return res.status(404).json({ message: response.message });
        }
        res.json(response);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running locally on http://localhost:${PORT}`);
});
