document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container');
    const searchContainer = document.getElementById('search-container');
    const authForm = document.getElementById('auth-form');
    const clientIdInput = document.getElementById('client_id');
    const clientSecretInput = document.getElementById('client_secret');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const searchBox = document.getElementById('search-box');
    const loadingDiv = document.getElementById('loading');
    const resultsContainer = document.getElementById('results-container');

    let comments = [];
    let fuse;

    // Load saved credentials
    if (localStorage.getItem('reddit_client_id')) {
        clientIdInput.value = localStorage.getItem('reddit_client_id');
    }
    if (localStorage.getItem('reddit_username')) {
        usernameInput.value = localStorage.getItem('reddit_username');
    }

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const clientId = clientIdInput.value.trim();
        const clientSecret = clientSecretInput.value.trim();
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (clientId && clientSecret && username && password) {
            // Save credentials
            localStorage.setItem('reddit_client_id', clientId);
            localStorage.setItem('reddit_username', username);

            await getComments(clientId, clientSecret, username, password);
        }
    });

    searchBox.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query) {
            const result = fuse.search(query);
            displayResults(result.map(r => r.item));
        } else {
            displayResults(comments);
        }
    });

    async function getComments(clientId, clientSecret, username, password) {
        loadingDiv.classList.remove('hidden');
        authContainer.classList.add('hidden');
        searchContainer.classList.remove('hidden');

        try {
            const token = await getAuthToken(clientId, clientSecret, username, password);
            let allComments = [];
            let after = null;

            do {
                const response = await fetch(`https://oauth.reddit.com/user/${username}/comments?limit=100&after=${after || ''}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.error) {
                    throw new Error(data.message);
                }
                allComments = allComments.concat(data.data.children.map(c => c.data));
                after = data.data.after;
            } while (after);

            comments = allComments;
            fuse = new Fuse(comments, {
                keys: ['body'],
                includeScore: true,
                threshold: 0.4
            });
            searchBox.disabled = false; // Enable search box
            displayResults(comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
            alert(`Error: ${error.message}`);
            authContainer.classList.remove('hidden');
            searchContainer.classList.add('hidden');
        } finally {
            loadingDiv.classList.add('hidden');
        }
    }

    async function getAuthToken(clientId, clientSecret, username, password) {
        const response = await fetch('https://www.reddit.com/api/v1/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: `grant_type=password&username=${username}&password=${password}&scope=read history`
        });
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error_description || data.error);
        }
        return data.access_token;
    }

    function displayResults(results) {
        resultsContainer.innerHTML = '';
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>No comments found.</p>';
            return;
        }

        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Comment</th>
                    <th>Subreddit</th>
                    <th>Score</th>
                    <th>Link</th>
                </tr>
            </thead>
            <tbody>
                ${results.map(comment => `
                    <tr>
                        <td>${comment.body}</td>
                        <td>${comment.subreddit}</td>
                        <td>${comment.score}</td>
                        <td><a href="https://reddit.com${comment.permalink}" target="_blank">View</a></td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        resultsContainer.appendChild(table);
    }
});