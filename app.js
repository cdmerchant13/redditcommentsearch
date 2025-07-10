document.addEventListener('DOMContentLoaded', () => {
    const clientIdInput = document.getElementById('client_id');
    const authContainer = document.getElementById('auth-container');
    const searchContainer = document.getElementById('search-container');
    const searchBox = document.getElementById('search-box');
    const subredditFilter = document.getElementById('subreddit-filter');
    const resultsContainer = document.getElementById('results-container');
    const loader = document.getElementById('loader');
    const loginButton = document.getElementById('login-button');
    const clearCacheButton = document.getElementById('clear-cache');

    const REDIRECT_URI = window.location.origin + window.location.pathname;
    let accessToken = null;
    let allComments = [];
    let username = null;

    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    function handleRedditLogin() {
        const clientId = clientIdInput.value;
        if (!clientId) {
            alert('Please enter your Reddit Client ID.');
            return;
        }
        localStorage.setItem('redditClientId', clientId);
        const state = Math.random().toString(36).substring(7);
        localStorage.setItem('redditAuthState', state);
        const authUrl = `https://www.reddit.com/api/v1/authorize?client_id=${clientId}&response_type=token&state=${state}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=history,identity`;
        window.location.href = authUrl;
    }

    async function handleAuthentication() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        if (params.has('access_token')) {
            accessToken = params.get('access_token');
            const state = params.get('state');
            const storedState = localStorage.getItem('redditAuthState');
            if (state === storedState) {
                localStorage.setItem('redditAccessToken', accessToken);
                authContainer.classList.add('hidden');
                searchContainer.classList.remove('hidden');
                window.location.hash = '';
                await fetchUserIdentity();
                fetchComments();
            } else {
                alert('Invalid state parameter. Please try logging in again.');
            }
        } else if (localStorage.getItem('redditAccessToken')) {
            accessToken = localStorage.getItem('redditAccessToken');
            authContainer.classList.add('hidden');
            searchContainer.classList.remove('hidden');
            await fetchUserIdentity();
            fetchComments();
        }
    }

    async function fetchUserIdentity() {
        if (!accessToken) return;
        try {
            const response = await fetch('https://oauth.reddit.com/api/v1/me', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const data = await response.json();
            username = data.name;
            localStorage.setItem('redditUsername', username);
        } catch (error) {
            console.error('Error fetching user identity:', error);
        }
    }

    async function fetchComments(after = null) {
        if (!accessToken || !username) return;

        loader.classList.remove('hidden');
        let url = `https://oauth.reddit.com/user/${username}/comments?limit=100`;
        if (after) {
            url += `&after=${after}`;
        }

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (response.status === 401) {
                // Token expired or invalid, clear it and re-authenticate
                clearCache();
                handleRedditLogin();
                return;
            }

            const data = await response.json();
            const comments = data.data.children.map(c => c.data);
            allComments.push(...comments);

            if (data.data.after) {
                fetchComments(data.data.after);
            } else {
                loader.classList.add('hidden');
                localStorage.setItem('redditComments', JSON.stringify(allComments));
                populateFilters();
                displayResults(allComments);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            loader.classList.add('hidden');
        }
    }

    function populateFilters() {
        const subreddits = [...new Set(allComments.map(c => c.subreddit))];
        const datalist = document.getElementById('subreddit-list');
        datalist.innerHTML = '';
        subreddits.sort().forEach(sub => {
            const option = document.createElement('option');
            option.value = sub;
            datalist.appendChild(option);
        });
    }

    function displayResults(comments) {
        resultsContainer.innerHTML = '';
        if (comments.length === 0) {
            resultsContainer.innerHTML = '<p>No comments found.</p>';
            return;
        }
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment';
            const redditLink = `https://www.reddit.com${comment.permalink}`;
            commentElement.innerHTML = `
                <p><strong>r/${comment.subreddit}</strong> - ${new Date(comment.created_utc * 1000).toLocaleDateString()}</p>
                <p>${comment.body_html}</p>
                <a href="${redditLink}" target="_blank">View on Reddit</a>
            `;
            resultsContainer.appendChild(commentElement);
        });
    }

    function triggerSearch() {
        const query = searchBox.value.toLowerCase();
        const subreddit = subredditFilter.value.toLowerCase();
        
        let filteredComments = allComments;

        if (subreddit) {
            filteredComments = filteredComments.filter(c => c.subreddit.toLowerCase() === subreddit);
        }

        if (query) {
            const fuse = new Fuse(filteredComments, { keys: ['body'], includeScore: true, threshold: 0.4 });
            filteredComments = fuse.search(query).map(result => result.item);
        }

        displayResults(filteredComments);
    }

    function clearCache() {
        localStorage.removeItem('redditAccessToken');
        localStorage.removeItem('redditComments');
        localStorage.removeItem('redditClientId');
        localStorage.removeItem('redditAuthState');
        localStorage.removeItem('redditUsername');
        allComments = [];
        accessToken = null;
        username = null;
        authContainer.classList.remove('hidden');
        searchContainer.classList.add('hidden');
        resultsContainer.innerHTML = '';
        clientIdInput.value = '';
        searchBox.value = '';
        subredditFilter.value = '';
    }

    loginButton.addEventListener('click', handleRedditLogin);
    clearCacheButton.addEventListener('click', clearCache);
    searchBox.addEventListener('input', debounce(triggerSearch, 300));
    subredditFilter.addEventListener('input', debounce(triggerSearch, 300));

    // Check for token on page load
    handleAuthentication();

    // Load client ID from local storage
    clientIdInput.value = localStorage.getItem('redditClientId') || '';
});