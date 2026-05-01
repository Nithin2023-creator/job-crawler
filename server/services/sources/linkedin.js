const { ApifyClient } = require('apify-client');

class LinkedInSource {
    constructor() {
        this.client = process.env.APIFY_API_TOKEN 
            ? new ApifyClient({ token: process.env.APIFY_API_TOKEN })
            : null;
    }

    /**
     * Search LinkedIn for jobs matching persona keywords
     * @param {string} query - Search query (e.g., "Backend Engineer Fresher")
     * @param {string} location - Location filter
     * @param {number} maxResults - Max results to fetch
     */
    async searchJobs(query, location = '', maxResults = 25) {
        if (!this.client) {
            console.log('⚠️ LinkedIn source skipped: No APIFY_API_TOKEN');
            return [];
        }

        console.log(`🔗 LinkedIn: Searching "${query}" in "${location}"...`);

        const input = {
            searchUrl: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`,
            maxItems: maxResults,
            proxy: { useApifyProxy: true }
        };

        const run = await this.client.actor('apify/linkedin-jobs-scraper').call(input);
        const { items } = await this.client.dataset(run.defaultDatasetId).listItems();

        // Normalize to our Job format
        return items.map(item => ({
            title: item.title || '',
            company: item.companyName || '',
            link: item.jobUrl || item.url || '',
            location: item.location || '',
            description: (item.description || '').substring(0, 3000),
            employmentType: item.employmentType || '',
            experienceLevel: item.experienceLevel || '',
            salary: item.salary || '',
            source: 'linkedin'
        }));
    }
}

module.exports = new LinkedInSource();
