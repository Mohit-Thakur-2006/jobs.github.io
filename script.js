document.addEventListener('DOMContentLoaded', () => {
    const jobListings = document.getElementById('job-listings');
    const searchInput = document.getElementById('search');
    const filterSelect = document.getElementById('filter-type');
    const sortSelect = document.getElementById('sort');
    const showMoreButton = document.getElementById('show-more');

    let jobs = [];
    let displayedJobs = [];
    let displayedJobIds = new Set(); // Track displayed job IDs to prevent duplicates
    const jobsPerPage = 10;
    let currentPage = 1;
    let searchQuery = '';

    // Fetch jobs from real-time Adzuna API
    async function fetchRealTimeJobs(page = 1, query = '') {
        const appId = '33eb9fa4';
        const appKey = 'ea6d2e163e5b7329c56685e759ef44c4';

        const url = `https://api.adzuna.com/v1/api/jobs/us/search/${page}?app_id=${appId}&app_key=${appKey}&results_per_page=50&what=${query}&content-type=application/json`;

        try {
            const response = await fetch(url);
            const apiJobs = await response.json();
            const formattedJobs = apiJobs.results.map(job => ({
                id: job.id,
                title: job.title,
                company: job.company.display_name,
                location: job.location.display_name,
                type: job.contract_type || "Full-time",
                posted: job.created
            }));
            return formattedJobs;
        } catch (error) {
            console.error('Error fetching real-time jobs:', error);
            return [];
        }
    }

    // Load jobs based on the search query
    async function loadRelevantJobs(query = '', loadMore = false) {
        let relevantJobs = [];
        let page = 1;

        // Reset displayed jobs if it's a fresh search
        if (!loadMore) {
            jobListings.innerHTML = '';
            displayedJobs = [];
            displayedJobIds.clear(); // Reset the set of displayed job IDs
        }

        while (relevantJobs.length < jobsPerPage) {
            const realTimeJobs = await fetchRealTimeJobs(page, query);

            // Filter jobs based on query and remove duplicates
            const matchingJobs = realTimeJobs.filter(job =>
                !displayedJobIds.has(job.id) &&
                (job.title.toLowerCase().includes(query) ||
                job.company.toLowerCase().includes(query) ||
                job.location.toLowerCase().includes(query) ||
                job.type.toLowerCase().includes(query))
            );

            relevantJobs = relevantJobs.concat(matchingJobs);
            
            if (realTimeJobs.length === 0) break; // Stop if no more jobs are found
            page++;
        }

        jobs = relevantJobs.slice(0, jobsPerPage); // Get only 10 jobs to display
        displayJobs(jobs);
    }

    const lightColors = ['#D0D4FF', '#FFD0D0', '#FFE0D0', '#FBFFD0', '#D0FFD8', '#D0FDFF', '#DBD0FF'];

    // Helper function to get a random color from the array
    function getRandomLightColor() {
        const randomIndex = Math.floor(Math.random() * lightColors.length);
        return lightColors[randomIndex];
    }

   // Display jobs and mark them as displayed
    function displayJobs(jobArray) {
        jobArray.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.classList.add('job-card');

            // Generate a random light color for each job's inner tag
            const randomLightColor = getRandomLightColor();

            jobCard.innerHTML = `
                <div class='inner-job-tag' style='background-color: ${randomLightColor};'>
                    <div class="save-button"><i class="fa fa-bookmark-o"></i></div>
                    <p class='posted-date'>${new Date(job.posted).toLocaleDateString()}</p>
                    <p class='company'>${job.company}</p>
                    <h3>${job.title}</h3>
                    <p class='job-type'>${job.type}</p>
                </div>
                <p class='job-location'>${job.location}</p>
            `;

            jobListings.appendChild(jobCard);
            displayedJobs.push(job);
            displayedJobIds.add(job.id); // Mark job ID as displayed to avoid duplicates
        });
    }

    // Show more jobs on button click
    showMoreButton.addEventListener('click', () => {
        loadRelevantJobs(searchQuery, true);
    });

    // Filter and sort jobs based on inputs
    function filterAndSortJobs() {
        searchQuery = searchInput.value.toLowerCase();
        const selectedType = filterSelect.value;
        const sortBy = sortSelect.value;

        // Reset displayed jobs if it's a fresh search
        if (searchQuery) {
            loadRelevantJobs(searchQuery); // Fetch new jobs based on search
        } else {
            // If no search query, filter and sort displayed jobs
            let filteredJobs = displayedJobs;

            if (selectedType) {
                filteredJobs = filteredJobs.filter(job => job.type === selectedType);
            }

            // Sort by latest if selected
            if (sortBy === 'latest') {
                filteredJobs.sort((a, b) => new Date(b.posted) - new Date(a.posted));
            }

            jobListings.innerHTML = ''; // Clear current jobs
            displayJobs(filteredJobs.slice(0, jobsPerPage)); // Display filtered and sorted jobs
        }
    }

    // Search functionality
    searchInput.addEventListener('input', filterAndSortJobs);

    // Filter by job type
    filterSelect.addEventListener('change', filterAndSortJobs);

    // Sort by latest or none
    sortSelect.addEventListener('change', filterAndSortJobs);

    // Initial fetch of jobs
    loadRelevantJobs();
});


document.addEventListener('DOMContentLoaded', function () {
    const locationElement = document.getElementById('location');

    // Fetch the user's location using ipapi
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            if (data.city && data.country) {
                locationElement.textContent = `${data.region}, ${data.country}`;
            } else {
                locationElement.textContent = 'Location unavailable';
            }
        })
        .catch(() => {
            locationElement.textContent = 'Unable to retrieve location';
        });
});
