class JSearchSource {
    constructor() {
        this.apiKey = process.env.RAPID_API_KEY;
        this.host = 'jsearch.p.rapidapi.com';
    }

    async searchJobs(query, location = '', maxResults = 20) {
        if (!this.apiKey) {
            console.log('⚠️ JSearch source skipped: No RAPID_API_KEY');
            return [];
        }

        console.log(`🔍 JSearch: Searching "${query}" in "${location}"...`);

        const params = new URLSearchParams({
            query: `${query} ${location}`.trim(),
            num_pages: '1',
            date_posted: 'week'  // Only recent postings
        });

        const response = await fetch(
            `https://${this.host}/search?${params}`,
            {
                headers: {
                    'X-RapidAPI-Key': this.apiKey,
                    'X-RapidAPI-Host': this.host
                }
            }
        );

        const data = await response.json();
        
        if (!data.data) return [];

        return data.data.map(item => ({
            title: item.job_title || '',
            company: item.employer_name || '',
            link: item.job_apply_link || item.job_google_link || '',
            location: item.job_city 
                ? `${item.job_city}, ${item.job_state || ''} ${item.job_country || ''}`
                : (item.job_is_remote ? 'Remote' : ''),
            description: (item.job_description || '').substring(0, 3000),
            employmentType: item.job_employment_type || '',
            experienceLevel: item.job_required_experience?.experience || '',
            salary: item.job_min_salary && item.job_max_salary 
                ? `${item.job_min_salary}-${item.job_max_salary} ${item.job_salary_currency || ''}`
                : '',
            source: 'jsearch'
        }));
    }
}

module.exports = new JSearchSource();
