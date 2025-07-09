document.addEventListener('DOMContentLoaded', () => {
    const clientIdInput = document.getElementById('client_id');
    const clientSecretInput = document.getElementById('client_secret');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    const storedClientId = localStorage.getItem('redditClientId');
    const storedClientSecret = localStorage.getItem('redditClientSecret');

    if (storedClientId) {
        clientIdInput.value = storedClientId;
    }
    if (storedClientSecret) {
        clientSecretInput.value = storedClientSecret;
    }

    const authForm = document.getElementById('auth-form');
    const authContainer = document.getElementById('auth-container');
    const searchContainer = document.getElementById('search-container');
    const rateLimitContainer = document.getElementById('rate-limit-container');
    const searchBox = document.getElementById('search-box');
    const subredditFilter = document.getElementById('subreddit-filter');
    const resultsContainer = document.getElementById('results-container');
    const loader = document.getElementById('loader');

    let accessToken = null;

    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const clientId = clientIdInput.value;
        const clientSecret = clientSecretInput.value;
        const username = usernameInput.value;
        const password = passwordInput.value;
        const loginButton = authForm.querySelector('button');

        if (clientId && clientSecret && username && password) {
            loginButton.disabled = true;
            loader.classList.remove('hidden');

            try {
                const response = await fetch('https://www.reddit.com/api/v1/access_token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
                    },
                    body: `grant_type=password&username=${username}&password=${password}`
                });

                updateRateLimitUI(response.headers);

                const data = await response.json();

                if (data.access_token) {
                    accessToken = data.access_token;
                    localStorage.setItem('redditClientId', clientId);
                    localStorage.setItem('redditClientSecret', clientSecret);

                    if (window.rybbit && window.rybbit.user) {
                        rybbit.user.identify(username);
                        rybbit.track('User Info Submitted');
                    }

                    authContainer.classList.add('hidden');
                    searchContainer.classList.remove('hidden');
                    rateLimitContainer.classList.remove('hidden');
                    searchBox.disabled = false;
                } else {
                    alert('Authentication failed. Please check your credentials.');
                }
            } catch (error) {
                console.error('Authentication error:', error);
                alert(`An error occurred during authentication: ${error.message}. This might be due to Reddit's API requiring a User-Agent header, which browsers restrict for security. Consider using a proxy server.`);
            } finally {
                loader.classList.add('hidden');
                loginButton.disabled = false;
            }
        }
    });

    const debouncedSearch = debounce(triggerSearch, 500);

    searchBox.addEventListener('input', debouncedSearch);
    subredditFilter.addEventListener('input', debouncedSearch);

    function triggerSearch() {
        const query = searchBox.value;
        const subreddit = subredditFilter.value;
        if (window.rybbit) {
            rybbit.track('Search Created', { query: query, subreddit: subreddit });
        }
        searchComments(query, subreddit);
    }

    async function searchComments(query, subreddit) {
        if (!accessToken) return;

        const username = usernameInput.value;
        try {
            const response = await fetch(`https://oauth.reddit.com/user/${username}/comments`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            updateRateLimitUI(response.headers);

            const data = await response.json();
            const comments = data.data.children.map(c => c.data);

            const filteredComments = comments.filter(c => {
                const queryMatch = query ? c.body.toLowerCase().includes(query.toLowerCase()) : true;
                const subredditMatch = subreddit ? c.subreddit.toLowerCase().includes(subreddit.toLowerCase()) : true;
                return queryMatch && subredditMatch;
            });

            displayResults(filteredComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
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
                <p><strong>${comment.author}</strong> in <em>r/${comment.subreddit}</em></p>
                <p>${comment.body}</p>
                <a href="${redditLink}" target="_blank" onclick="if(window.rybbit){rybbit.track('Comment Clicked', { url: '${redditLink}' })}">View on Reddit</a>
            `;
            resultsContainer.appendChild(commentElement);
        });
    }

    function updateRateLimitUI(headers) {
        const used = headers.get('x-ratelimit-used');
        const remaining = headers.get('x-ratelimit-remaining');
        const reset = headers.get('x-ratelimit-reset');

        document.getElementById('ratelimit-used').textContent = used;
        document.getElementById('ratelimit-remaining').textContent = remaining;
        document.getElementById('ratelimit-reset').textContent = reset;
    }
});
