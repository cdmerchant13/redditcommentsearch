document.addEventListener('DOMContentLoaded', () => {
    // Pre-populate API details from localStorage
    const clientIdInput = document.getElementById('client_id');
    const clientSecretInput = document.getElementById('client_secret');
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
    const searchBox = document.getElementById('search-box');
    const subredditFilter = document.getElementById('subreddit-filter');
    const resultsContainer = document.getElementById('results-container');
    const usernameInput = document.getElementById('username');

    const loader = document.getElementById('loader');

    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = usernameInput.value;
        const loginButton = authForm.querySelector('button');

        if (username) {
            loginButton.disabled = true;
            loader.classList.remove('hidden');

<<<<<<< Updated upstream
            // Simulate a network request
            setTimeout(() => {
                // Save API details to localStorage
                localStorage.setItem('redditClientId', clientIdInput.value);
                localStorage.setItem('redditClientSecret', clientSecretInput.value);
=======
            try {
                const response = await fetch('http://localhost:3000/authenticate', { // Point to proxy
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json' // Send as JSON to proxy
                    },
                    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, username: username, password: password })
                });
>>>>>>> Stashed changes

                if (window.rybbit) {
                    rybbit.user.identify(username);
                    rybbit.track('User Info Submitted');
                }
<<<<<<< Updated upstream
                authContainer.classList.add('hidden');
                searchContainer.classList.remove('hidden');
                searchBox.disabled = false;
=======
            } catch (error) {
                console.error('Authentication error:', error);
                alert(`An error occurred during authentication: ${error.message}. Please ensure the proxy server is running.`);
            } finally {
>>>>>>> Stashed changes
                loader.classList.add('hidden');
                loginButton.disabled = false;
            }, 1500);
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

    function searchComments(query, subreddit) {
        // Mock search function - in a real app, this would be an API call
        console.log(`Searching for "${query}" in "r/${subreddit}"`);
        const mockComments = [
            { author: 'dev1', subreddit: 'webdev', body: 'Rybbit analytics seems easy to integrate.', permalink: '/r/webdev/comments/123/slug/c1' },
            { author: 'ux_guru', subreddit: 'design', body: 'Good analytics are key for UX.', permalink: '/r/design/comments/456/slug/c2' },
            { author: 'js_fan', subreddit: 'javascript', body: 'I wonder if Rybbit has a node.js library.', permalink: '/r/javascript/comments/789/slug/c3' }
        ];

<<<<<<< Updated upstream
        const filteredComments = mockComments.filter(c => {
            const queryMatch = query ? c.body.toLowerCase().includes(query.toLowerCase()) : true;
            const subredditMatch = subreddit ? c.subreddit.toLowerCase().includes(subreddit.toLowerCase()) : true;
            return queryMatch && subredditMatch;
        });

        displayResults(filteredComments);
=======
        const username = usernameInput.value;
        try {
            const response = await fetch(`http://localhost:3000/user-comments/${username}`, { // Point to proxy
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
            alert(`An error occurred while fetching comments: ${error.message}. Please ensure the proxy server is running.`);
        }
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======

    function updateRateLimitUI(headers) {
        const used = headers.get('x-ratelimit-used');
        const remaining = headers.get('x-ratelimit-remaining');
        const reset = headers.get('x-ratelimit-reset');

        document.getElementById('ratelimit-used').textContent = used;
        document.getElementById('ratelimit-remaining').textContent = remaining;
        document.getElementById('ratelimit-reset').textContent = reset;
    }
>>>>>>> Stashed changes
});