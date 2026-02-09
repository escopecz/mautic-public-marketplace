'use strict';

var MarketplaceRating = {
    init: function () {
        var container = document.getElementById('marketplace-review-container');
        if (!container) {
            return;
        }

        var AUTH0_DOMAIN = container.getAttribute('data-auth0-domain');
        var AUTH0_CLIENT_ID = container.getAttribute('data-auth0-client-id');
        var API_URL = container.getAttribute('data-api-url');
        var PACKAGE_NAME = container.getAttribute('data-package-name');
        var AUTH0_SDK_URL = 'https://cdn.auth0.com/js/auth0-spa-js/2.0/auth0-spa-js.production.js';

        var auth0Client = null;

        var loadingEl = document.getElementById('auth-loading');
        var loginEl = document.getElementById('auth-login');
        var formEl = document.getElementById('auth-form');
        var userNameEl = document.getElementById('auth-user-name');
        var errorEl = document.getElementById('review-error');
        var successEl = document.getElementById('review-success');
        var submitBtn = document.getElementById('submit-btn');

        function loadAuth0SDK() {
            return new Promise(function (resolve, reject) {
                if (typeof auth0 !== 'undefined') {
                    resolve();
                    return;
                }

                var script = document.createElement('script');
                script.src = AUTH0_SDK_URL;
                script.onload = resolve;
                script.onerror = function () {
                    reject(new Error('Failed to load Auth0 SDK'));
                };
                document.head.appendChild(script);
            });
        }

        async function initAuth0() {
            try {
                await loadAuth0SDK();

                auth0Client = await auth0.createAuth0Client({
                    domain: AUTH0_DOMAIN,
                    clientId: AUTH0_CLIENT_ID,
                    cacheLocation: 'localstorage'
                });

                if (window.location.search.includes('code=')) {
                    await auth0Client.handleRedirectCallback();
                    window.history.replaceState({}, document.title, window.location.pathname);
                }

                await updateUI();
            } catch (e) {
                console.error('Auth0 init error:', e);
                showError('Failed to initialize authentication.');
                loadingEl.style.display = 'none';
                loginEl.style.display = 'block';
            }
        }

        async function updateUI() {
            loadingEl.style.display = 'none';

            var isAuthenticated = await auth0Client.isAuthenticated();

            if (isAuthenticated) {
                var user = await auth0Client.getUser();
                userNameEl.textContent = user.name || user.email;
                loginEl.style.display = 'none';
                formEl.style.display = 'block';
            } else {
                loginEl.style.display = 'block';
                formEl.style.display = 'none';
            }
        }

        document.getElementById('auth0-login-btn').addEventListener('click', async function () {
            try {
                await auth0Client.loginWithPopup();
                await updateUI();
            } catch (e) {
                console.error('Login error:', e);
                showError('Login failed. Please try again.');
            }
        });

        document.getElementById('auth0-logout-btn').addEventListener('click', async function (e) {
            e.preventDefault();
            await auth0Client.logout({ logoutParams: { returnTo: window.location.origin } });
        });

        var stars = document.querySelectorAll('#rating-stars .star-icon');
        var ratingInput = document.getElementById('rating');

        stars.forEach(function (star) {
            star.addEventListener('click', function () {
                var rating = this.getAttribute('data-rating');
                ratingInput.value = rating;
                updateStars(rating);
            });

            star.addEventListener('mouseenter', function () {
                var rating = this.getAttribute('data-rating');
                highlightStars(rating);
            });

            star.addEventListener('mouseleave', function () {
                highlightStars(ratingInput.value);
            });
        });

        function updateStars(rating) {
            stars.forEach(function (s, index) {
                if (index < rating) {
                    s.classList.add('star-active');
                } else {
                    s.classList.remove('star-active');
                }
            });
        }

        function highlightStars(rating) {
            stars.forEach(function (s, index) {
                if (index < rating) {
                    s.classList.add('star-hover');
                } else {
                    s.classList.remove('star-hover');
                }
            });
        }

        document.getElementById('review-form').addEventListener('submit', async function (e) {
            e.preventDefault();

            var rating = parseInt(ratingInput.value);
            var review = document.getElementById('review').value;

            if (rating < 1 || rating > 5) {
                showError('Please select a rating between 1 and 5 stars.');
                return;
            }

            if (!review.trim()) {
                showError('Please write a review.');
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
                hideMessages();

                var token = await auth0Client.getTokenSilently();

                var response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        package: PACKAGE_NAME,
                        rating: rating,
                        review: review
                    })
                });

                if (!response.ok) {
                    var data = await response.json();
                    throw new Error(data.error || 'Failed to submit review');
                }

                window.location.reload();
            } catch (err) {
                console.error('Submit error:', err);
                showError('Failed to submit review. Please try again.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit review';
            }
        });

        function showError(msg) {
            errorEl.textContent = msg;
            errorEl.style.display = 'block';
            successEl.style.display = 'none';
        }

        function showSuccess(msg) {
            successEl.textContent = msg;
            successEl.style.display = 'block';
            errorEl.style.display = 'none';
        }

        function hideMessages() {
            errorEl.style.display = 'none';
            successEl.style.display = 'none';
        }

        initAuth0();
    }
};

document.addEventListener('DOMContentLoaded', function () {
    MarketplaceRating.init();
});
