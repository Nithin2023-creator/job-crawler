const Groq = require('groq-sdk');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let groq = null;
if (process.env.GROQ_API_KEY) {
    groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });
} else {
    console.warn('⚠️ NightCrawler: GROQ_API_KEY is missing. AI filtering will be disabled.');
}

class AIFilter {
    /**
     * Filter a list of jobs using Groq LLM based on user persona
     * Uses Index-Based Selection to save tokens
     * @param {Array} jobs - List of job objects { title, link, location, ... }
     * @param {String} userPersona - User's job preference description
     * @returns {Promise<Array>} - List of matching job objects
     */
    async filterJobs(jobs, userPersona) {
        if (!jobs || jobs.length === 0) return [];

        if (!groq) {
            console.warn('⚠️ AI Filter skipped: No API Key.');
            throw new Error('GROQ_API_KEY_MISSING');
        }

        console.log(`🤖 AI Filter: Processing ${jobs.length} jobs against persona: "${userPersona}"`);

        const BATCH_SIZE = 30;
        const selectedJobs = [];

        // Split into chunks
        for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
            const chunk = jobs.slice(i, i + BATCH_SIZE);
            console.log(`   Processing batch ${i / BATCH_SIZE + 1} (${chunk.length} jobs)...`);

            try {
                const matches = await this.processBatch(chunk, userPersona);
                selectedJobs.push(...matches);
            } catch (error) {
                console.error('   ❌ Batch failed:', error.message);
                // Continue to next batch? Or fail hard? 
                // Let's continue to try to get partial results.
            }
        }

        return selectedJobs;
    }

    /**
     * Process a single batch of jobs
     */
    async processBatch(batch, persona) {
        // 1. Format jobs as numbered list
        const jobListText = batch.map((job, index) => {
            return `${index}: ${job.title} ${job.location ? `(${job.location})` : ''} - ${job.company || ''}`;
        }).join('\n');

        // 2. Construct Prompt
        const systemPrompt = `You are a strict technical recruiter. 
        Analyze the Job List and find jobs that match the Candidate Persona.
        
        Rules:
        1. Return ONLY a JSON object with a single key "matchIds".
        2. "matchIds" must be an array of integers representing the indices of matching jobs.
        3. Be strict. If the location or role doesn't fit the persona, do not include it.
        4. Do not output any markdown or explanation.
        
        Example Output: { "matchIds": [0, 4, 12] }`;

        const userMessage = `Candidate Persona: ${persona}\n\nJob List:\n${jobListText}`;

        console.log('\n--- 📤 SENDING TO AI ---');
        console.log(userMessage);
        console.log('------------------------\n');

        // 3. Call Groq
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ],
            model: 'llama-3.3-70b-versatile',
            temperature: 0,
            response_format: { type: 'json_object' }
        });

        // 4. Parse Response
        const content = chatCompletion.choices[0]?.message?.content;

        console.log('\n--- 📥 AI RESPONSE ---');
        console.log(content);
        console.log('----------------------\n');

        if (!content) return [];

        try {
            const parsed = JSON.parse(content);
            const indices = parsed.matchIds;

            if (!Array.isArray(indices)) return [];

            // Map indices back to objects
            const matches = indices
                .filter(idx => Number.isInteger(idx) && idx >= 0 && idx < batch.length)
                .map(idx => batch[idx]);

            console.log(`      Selected ${matches.length}/${batch.length} jobs`);
            return matches;

        } catch (e) {
            console.error('      Failed to parse AI response:', content);
            return [];
        }
    }
}

module.exports = new AIFilter();
