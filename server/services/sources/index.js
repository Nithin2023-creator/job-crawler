const linkedIn = require('./linkedin');
const jsearch = require('./jsearch');

class MultiSourceAggregator {
    /**
     * Search all configured external sources
     * @param {Object} searchConfig - { query, location, maxPerSource }
     * @returns {Array} - Normalized job objects
     */
    async searchAll({ query, location = '', maxPerSource = 20 }) {
        console.log(`\n🌐 Multi-Source Search: "${query}" @ "${location}"`);
        
        const results = await Promise.allSettled([
            linkedIn.searchJobs(query, location, maxPerSource),
            jsearch.searchJobs(query, location, maxPerSource),
        ]);

        const allJobs = [];
        const sourceNames = ['LinkedIn', 'JSearch'];

        results.forEach((result, idx) => {
            if (result.status === 'fulfilled') {
                console.log(`   ✅ ${sourceNames[idx]}: ${result.value.length} jobs`);
                allJobs.push(...result.value);
            } else {
                console.log(`   ❌ ${sourceNames[idx]}: ${result.reason.message}`);
            }
        });

        // Deduplicate by title+company (fuzzy)
        const seen = new Set();
        const unique = allJobs.filter(job => {
            const key = `${job.title.toLowerCase().trim()}|${job.company.toLowerCase().trim()}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        console.log(`   🎯 Total unique jobs from external sources: ${unique.length}`);
        return unique;
    }
}

module.exports = new MultiSourceAggregator();
