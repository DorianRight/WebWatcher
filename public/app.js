document.addEventListener('DOMContentLoaded', function() {
    const websiteForm = document.getElementById('websiteForm');
    const websitesList = document.getElementById('websitesList');

    websiteForm.addEventListener('submit', addWebsite);

    async function addWebsite(e) {
        e.preventDefault();

        const name = document.getElementById('websiteName').value;
        const url = document.getElementById('websiteUrl').value;

        try {
            const response = await fetch('/api/websites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, url })
            });

            if (response.ok) {
                websiteForm.reset();
                loadWebsites();
            } else {
                alert('Error adding website');
            }
        } catch (error) {
            alert('Error adding website: ' + error.message);
        }
    }

    async function loadWebsites() {
        try {
            const response = await fetch('/api/websites');
            const websites = await response.json();

            if (websites.length === 0) {
                websitesList.innerHTML = '<p>No websites added yet</p>';
                return;
            }

            websitesList.innerHTML = '';
            websites.forEach(website => {
                const websiteCard = createWebsiteCard(website);
                websitesList.appendChild(websiteCard);
            });
        } catch (error) {
            websitesList.innerHTML = '<p>Error loading websites</p>';
        }
    }

    function createWebsiteCard(website) {
        const card = document.createElement('div');
        card.className = 'website-card';
        card.innerHTML = `
            <div class="website-info">
                <h3>${website.name}</h3>
                <p>${website.url}</p>
                <small>Added: ${new Date(website.created_at).toLocaleString()}</small>
            </div>
            <div class="website-status">
                <span class="status-indicator" id="status-${website.id}"></span>
                <button class="check-button" onclick="checkWebsite(${website.id})">Check Now</button>
            </div>
        `;
        return card;
    }

    window.checkWebsite = async function(websiteId) {
        const button = event.target;
        const statusIndicator = document.getElementById(`status-${websiteId}`);

        button.disabled = true;
        button.textContent = 'Checking...';

        try {
            const response = await fetch(`/api/check/${websiteId}`, { method: 'POST' });
            const result = await response.json();

            if (result.isUp) {
                statusIndicator.className = 'status-indicator up';
                button.parentElement.parentElement.className = 'website-card status-up';
            } else {
                statusIndicator.className = 'status-indicator down';
                button.parentElement.parentElement.className = 'website-card status-down';
            }

            console.log(`Website check result:`, result);
        } catch (error) {
            console.error('Error checking website:', error);
        } finally {
            button.disabled = false;
            button.textContent = 'Check Now';
        }
    };

    loadWebsites();
});