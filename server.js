const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data', 'leaderboard.json');

function loadLeaderboard() {
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
    const data = fs.readFileSync(DATA_FILE);
    const leaderboard = JSON.parse(data);
    return leaderboard;
}

function saveLeaderboard(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Hardcoded login
const auth = { login: 'admin', password: 'leaderboard123' };

// JSON-only checkAuth
function checkAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const b64auth = authHeader.split(' ')[1];
    const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

    if (login === auth.login && password === auth.password) {
        return next();
    } else {
        return res.status(403).json({ error: 'Invalid credentials' });
    }
}

// GET leaderboard
app.get('/leaderboard', (req, res) => {
    res.json(loadLeaderboard());
});

// POST add team
app.post('/leaderboard', checkAuth, (req, res) => {
    const leaderboard = loadLeaderboard();
    const newId = leaderboard.length ? Math.max(...leaderboard.map(t => t.id)) + 1 : 1;
    const newTeam = {
        id: newId,
        name: req.body.name || "New Team",
        points: 0
    };
    leaderboard.push(newTeam);
    saveLeaderboard(leaderboard);
    res.json(newTeam);
});

// DELETE team
app.delete('/leaderboard/:teamId', checkAuth, (req, res) => {
    let leaderboard = loadLeaderboard();
    const teamId = parseInt(req.params.teamId);
    const newLeaderboard = leaderboard.filter(team => team.id !== teamId);
    if (newLeaderboard.length === leaderboard.length) {
        return res.status(404).json({ error: "Team not found" });
    }
    saveLeaderboard(newLeaderboard);
    res.json({ success: true });
});

// PATCH team points
app.patch('/leaderboard/:teamId', checkAuth, (req, res) => {
    let leaderboard = loadLeaderboard();
    const teamId = parseInt(req.params.teamId);
    const team = leaderboard.find(t => t.id === teamId);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const delta = parseInt(req.body.delta) || 0;
    team.points += delta;
    saveLeaderboard(leaderboard);
    res.json(team);
});

app.listen(PORT, () => {
    console.log(`Leaderboard app running at http://localhost:${PORT}`);
});
