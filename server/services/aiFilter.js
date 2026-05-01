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
        // 1. Format jobs as numbered list with rich context
        const jobListText = batch.map((job, index) => {
            let entry = `${index}: ${job.title}`;
            if (job.location) entry += ` | Location: ${job.location}`;
            if (job.company) entry += ` | Company: ${job.company}`;
            if (job.employmentType) entry += ` | Type: ${job.employmentType}`;
            if (job.experienceLevel) entry += ` | Level: ${job.experienceLevel}`;
            if (job.salary) entry += ` | Salary: ${job.salary}`;
            // Include truncated description for AI context
            if (job.description) entry += `\n   Desc: ${job.description.substring(0, 500)}`;
            return entry;
        }).join('\n\n');

        // 2. Construct Prompt
        const systemPrompt = `You are an expert technical recruiter performing candidate-job matching.

For each job, assign a relevance score from 0 to 100 based on how well it matches the candidate.

Scoring rubric:
- 90-100: Perfect match (role, level, location, tech stack all align)
- 70-89: Strong match (most criteria align, minor gaps)
- 40-69: Partial match (some criteria align but significant gaps)
- 0-39: Poor match (wrong level, field, or location)

Consider these factors:
1. Role alignment with persona's target roles
2. Experience level match (don't suggest senior roles to freshers)
3. Tech stack overlap
4. Location compatibility
5. Employment type preference

Return ONLY a JSON object:
{ "scores": [{ "id": 0, "score": 85, "reason": "brief reason" }] }

Only include jobs scoring >= 40. Omit irrelevant jobs entirely.`;

        const userMessage = `Candidate Persona:\n${persona}\n\nJobs:\n${jobListText}`;

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
            if (!parsed.scores || !Array.isArray(parsed.scores)) return [];

            const matches = parsed.scores
                .filter(s => Number.isInteger(s.id) && s.id >= 0 && s.id < batch.length && s.score >= 40)
                .map(s => ({
                    ...batch[s.id],
                    relevanceScore: s.score,
                    matchReason: s.reason || ''
                }));

            console.log(`      Selected ${matches.length}/${batch.length} jobs (score >= 40)`);
            return matches;

        } catch (e) {
            console.error('      Failed to parse AI response:', content);
            return [];
        }
    }
}

module.exports = new AIFilter();
