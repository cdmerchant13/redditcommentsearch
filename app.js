document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container');
    const searchContainer = document.getElementById('search-container');
    const authForm = document.getElementById('auth-form');
    const clientIdInput = document.getElementById('client_id');
    const clientSecretInput = document.getElementById('client_secret');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const searchBox = document.getElementById('search-box');
    const subredditFilter = document.getElementById('subreddit-filter');
    const clearCacheBtn = document.getElementById('clear-cache');
    const loadingDiv = document.getElementById('loading');
    const resultsContainer = document.getElementById('results-container');

    let allComments = [];
    let comments = [];
    let fuse;
    let sortColumn = null;
    let sortDirection = 'desc';

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

    searchBox.addEventListener('input', () => applyFiltersAndSearch());
    subredditFilter.addEventListener('input', () => applyFiltersAndSearch());

    clearCacheBtn.addEventListener('click', () => {
        const username = localStorage.getItem('reddit_username');
        if (username) {
            localStorage.removeItem(`reddit_comments_${username}`);
            alert('Cache cleared!');
            allComments = [];
            comments = [];
            displayResults([]);
        }
    });

    resultsContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'TH' && e.target.dataset.sort) {
            const column = e.target.dataset.sort;
            if (sortColumn === column) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = column;
                sortDirection = 'desc';
            }
            applyFiltersAndSearch();
        }
    });

    async function getComments(clientId, clientSecret, username, password) {
        loadingDiv.classList.remove('hidden');
        authContainer.classList.add('hidden');
        searchContainer.classList.remove('hidden');

        const cacheKey = `reddit_comments_${username}`;
        const cachedComments = JSON.parse(localStorage.getItem(cacheKey) || 'null');

        if (cachedComments) {
            allComments = cachedComments;
            comments = allComments;
            applyFiltersAndSearch();
        }

        try {
            const token = await getAuthToken(clientId, clientSecret, username, password);
            let fetchedComments = [];
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
                fetchedComments = fetchedComments.concat(data.data.children.map(c => c.data));
                after = data.data.after;
            } while (after);

            // Merge and save comments
            const commentMap = new Map(allComments.map(c => [c.id, c]));
            fetchedComments.forEach(c => commentMap.set(c.id, c));
            allComments = Array.from(commentMap.values());
            localStorage.setItem(cacheKey, JSON.stringify(allComments));

            comments = allComments;
            fuse = new Fuse(comments, {
                keys: ['body'],
                includeScore: true,
                threshold: 0.4
            });
            searchBox.disabled = false; // Enable search box
            applyFiltersAndSearch();
        } catch (error) {
            console.error('Error fetching comments:', error);
            alert(`Error: ${error.message}`);
            if (!cachedComments) {
                authContainer.classList.remove('hidden');
                searchContainer.classList.add('hidden');
            }
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

    function applyFiltersAndSearch() {
        let filteredComments = allComments;

        // Subreddit filter
        const subredditQuery = subredditFilter.value.trim().toLowerCase();
        if (subredditQuery) {
            filteredComments = filteredComments.filter(c => c.subreddit.toLowerCase().includes(subredditQuery));
        }

        // Search
        const searchQuery = searchBox.value.trim();
        if (searchQuery) {
            fuse.setCollection(filteredComments);
            filteredComments = fuse.search(searchQuery).map(r => r.item);
        } else {
            fuse = new Fuse(filteredComments, {
                keys: ['body'],
                includeScore: true,
                threshold: 0.4
            });
        }

        // Sorting
        if (sortColumn) {
            filteredComments.sort((a, b) => {
                if (a[sortColumn] < b[sortColumn]) return sortDirection === 'asc' ? -1 : 1;
                if (a[sortColumn] > b[sortColumn]) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        displayResults(filteredComments);
    }

    function displayResults(results) {
        resultsContainer.innerHTML = '';
        if (results.length === 0) {
            resultsContainer.innerHTML = '<p>No comments found.</p>';
            return;
        }

        const table = document.createElement('table');
        const sortIndicator = (column) => {
            if (sortColumn === column) {
                return sortDirection === 'asc' ? ' ▲' : ' ▼';
            }
            return '';
        };

        table.innerHTML = `
            <thead>
                <tr>
                    <th>Comment</th>
                    <th>Subreddit</th>
                    <th data-sort="score" class="sortable">Score${sortIndicator('score')}</th>
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