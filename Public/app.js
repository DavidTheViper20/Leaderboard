const teamsList = document.getElementById('teams');
const addTeamSection = document.getElementById('addTeamSection');
const editBtn = document.getElementById('editBtn');
let isAdmin = false;

// Hide add team section initially
addTeamSection.style.display = 'none';

// Modal elements
const loginModal = document.getElementById('loginModal');
const modalOverlay = document.getElementById('modalOverlay');
const loginSubmit = document.getElementById('loginSubmit');
const loginCancel = document.getElementById('loginCancel');
const loginMessage = document.getElementById('loginMessage');

// Display today's date
const dateElem = document.getElementById('date');
const today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0');
const yyyy = today.getFullYear();
dateElem.textContent = `${dd}/${mm}/${yyyy}`;

// -------------------- Load Leaderboard --------------------
function loadLeaderboard() {
    fetch('/leaderboard')
        .then(res => res.json())
        .then(data => {
            // Sort teams by points
            data.sort((a, b) => b.points - a.points);

            // Capture current positions
            const prevPositions = {};
            document.querySelectorAll('#teams li').forEach(li => {
                prevPositions[li.dataset.id] = li.getBoundingClientRect().top;
            });

            teamsList.innerHTML = '';

            data.forEach(team => {
                const li = document.createElement('li');
                li.dataset.id = team.id; // track ID for animation
                li.style.backgroundColor = team.colour || '#333';
                li.style.borderRadius = '5px';
                li.style.margin = '5px 0';
                li.style.padding = '10px';

                const teamRow = document.createElement('div');
                teamRow.className = 'team-row';
                teamRow.style.display = 'flex';
                teamRow.style.justifyContent = 'space-between';
                teamRow.style.alignItems = 'center';

                // Left: icon + name
                const teamLeft = document.createElement('div');
                teamLeft.className = 'team-left';
                teamLeft.style.display = 'flex';
                teamLeft.style.alignItems = 'center';

                const icon = document.createElement('div');
                icon.className = 'team-icon';
                if (team.logo) icon.style.backgroundImage = `url('${team.logo}')`;
                icon.style.backgroundSize = 'cover';

                const nameSpan = document.createElement('span');
                nameSpan.className = 'team-name';
                nameSpan.textContent = team.name;

                teamLeft.appendChild(icon);
                teamLeft.appendChild(nameSpan);

                // Right: score + admin buttons
                const teamRight = document.createElement('div');
                teamRight.className = 'team-right';
                teamRight.style.display = 'flex';
                teamRight.style.alignItems = 'center';
                teamRight.style.gap = '5px';

                const scoreBox = document.createElement('div');
                scoreBox.className = 'score-box';
                scoreBox.textContent = team.points;
                teamRight.appendChild(scoreBox);

                if (isAdmin) {
                    const plusBtn = document.createElement('button');
                    plusBtn.className = 'plus-btn';
                    plusBtn.textContent = '+';
                    plusBtn.onclick = e => { e.stopPropagation(); changePoints(team.id, 1); };

                    const minusBtn = document.createElement('button');
                    minusBtn.className = 'minus-btn';
                    minusBtn.textContent = '−';
                    minusBtn.onclick = e => { e.stopPropagation(); changePoints(team.id, -1); };

                    const removeBtn = document.createElement('button');
                    removeBtn.className = 'team-btn';
                    removeBtn.textContent = 'Remove';
                    removeBtn.onclick = e => { 
                        e.stopPropagation(); 
                        if (confirm(`Are you sure you want to delete "${team.name}"?`)) removeTeam(team.id); 
                    };

                    teamRight.appendChild(plusBtn);
                    teamRight.appendChild(minusBtn);
                    teamRight.appendChild(removeBtn);
                }

                teamRow.appendChild(teamLeft);
                teamRow.appendChild(teamRight);
                li.appendChild(teamRow);
                teamsList.appendChild(li);

                // Animate move
                if (prevPositions[team.id] !== undefined) {
                    const delta = prevPositions[team.id] - li.getBoundingClientRect().top;
                    if (delta) {
                        li.style.transform = `translateY(${delta}px)`;
                        requestAnimationFrame(() => {
                            li.style.transition = 'transform 0.5s ease';
                            li.style.transform = '';
                        });
                    }
                }
            });
        });
}


// -------------------- Admin Functions --------------------
function addTeam() {
    const name = document.getElementById('teamName').value.trim();
    if(!name) return alert('Enter a team name');

    fetch('/leaderboard', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa('admin:leaderboard123'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
    }).then(() => {
        document.getElementById('teamName').value = '';
        loadLeaderboard();
    });
}

function removeTeam(teamId) {
    fetch(`/leaderboard/${teamId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': 'Basic ' + btoa('admin:leaderboard123')
        }
    }).then(() => loadLeaderboard());
}

function changePoints(teamId, delta) {
    fetch(`/leaderboard/${teamId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': 'Basic ' + btoa('admin:leaderboard123'),
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ delta })
    }).then(() => loadLeaderboard());
}

// -------------------- Login / Logout --------------------
editBtn.addEventListener('click', () => {
    if(!isAdmin) {
        loginModal.style.display = 'block';
        modalOverlay.style.display = 'block';
    } else {
        // Logout
        isAdmin = false;
        addTeamSection.style.display = 'none';
        editBtn.textContent = 'Edit';
        loadLeaderboard();
    }
});

function hideModal() {
    loginModal.style.display = 'none';
    modalOverlay.style.display = 'none';
}

loginCancel.addEventListener('click', hideModal);

loginSubmit.addEventListener('click', () => {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if(username === 'millpark' && password === '1234') {
        isAdmin = true;
        addTeamSection.style.display = 'block';
        hideModal();
        editBtn.textContent = 'Logout';
        loadLeaderboard();

        loginMessage.style.color = 'green';
        loginMessage.textContent = 'Access granted!';
        setTimeout(() => loginMessage.textContent = '', 3000);
    } else {
        loginMessage.style.color = 'red';
        loginMessage.textContent = 'Incorrect credentials';
        setTimeout(() => loginMessage.textContent = '', 3000);
    }
});

// Initial load
loadLeaderboard();
