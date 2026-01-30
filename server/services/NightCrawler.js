const puppeteer = require('puppeteer');
const Job = require('../models/Job');
const CrawlerLog = require('../models/CrawlerLog');
const Company = require('../models/Company');
const Settings = require('../models/Settings');
const AIFilter = require('./aiFilter');

/**
 * NightCrawler Service
 * The core scraping engine for overnight job hunting
 */
class NightCrawler {
    constructor() {
        this.browser = null;
        this.isRunning = false;
    }

    /**
     * Generate random delay between min and max seconds
     */
    randomDelay(minSeconds, maxSeconds) {
        const delay = Math.floor(Math.random() * (maxSeconds - minSeconds + 1) + minSeconds) * 1000;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * Initialize Puppeteer browser with stealth settings
     */
    async initBrowser() {
        console.log('🌙 NightCrawler: Initializing browser...');

        this.browser = await puppeteer.launch({
            headless: process.env.HEADLESS !== 'false',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--disable-gpu',
                '--window-size=1920,1080'
            ]
        });

        console.log('✅ NightCrawler: Browser initialized');
        return this.browser;
    }

    /**
     * Close browser safely - CRITICAL for memory safety
     */
    async closeBrowser() {
        if (this.browser) {
            try {
                await this.browser.close();
                console.log('🔒 NightCrawler: Browser closed safely');
            } catch (error) {
                console.error('⚠️ NightCrawler: Error closing browser:', error.message);
            }
            this.browser = null;
        }
    }

    /**
     * Check if text matches any of the target keywords (case-insensitive)
     */
    matchesKeywords(text, keywords) {
        if (!keywords || keywords.length === 0) return true;
        const lowerText = text.toLowerCase();
        return keywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
    }

    /**
     * Extract jobs from a single page with Pagination support
     */
    async scrapePage(page, url, companyId) {
        const MAX_PAGES = 20;
        let allJobs = [];
        let pageCount = 0;
        let hasMorePages = true;

        try {
            console.log(`📡 NightCrawler: Navigating to ${url}`);

            // Navigate to initial URL
            await page.goto(url, {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            // Initial wait for content
            try {
                await Promise.race([
                    page.waitForSelector('a[href*="job"]', { timeout: 10000 }),
                    page.waitForSelector('a[href*="career"]', { timeout: 10000 }),
                    page.waitForSelector('.job', { timeout: 10000 }),
                    new Promise(resolve => setTimeout(resolve, 5000))
                ]);
            } catch (e) {
                console.log('⏳ NightCrawler: Initial wait timeout, proceeding...');
            }

            while (hasMorePages && pageCount < MAX_PAGES) {
                pageCount++;
                console.log(`\n📄 NightCrawler: Scraping Page ${pageCount} of ${url}`);

                // 1. Scrape current view
                const pageJobs = await this.extractJobsFromView(page, url, companyId);

                // Add new unique jobs (deduplication based on link)
                let newJobsCount = 0;
                for (const job of pageJobs) {
                    if (!allJobs.some(existing => existing.link === job.link)) {
                        allJobs.push(job);
                        newJobsCount++;
                    }
                }
                console.log(`   + Found ${newJobsCount} new jobs on this page.`);

                // 2. Check for Pagination (Next Button vs Infinite Scroll)
                if (pageCount < MAX_PAGES) {
                    const paginationResult = await this.handlePagination(page);
                    if (!paginationResult) {
                        console.log('🛑 NightCrawler: No more pages detected.');
                        hasMorePages = false;
                    } else {
                        // Wait a bit for new content to load
                        await this.randomDelay(2, 4);
                    }
                }
            }

            console.log(`✅ NightCrawler: Total jobs found across ${pageCount} pages: ${allJobs.length}`);

            if (allJobs.length === 0) {
                console.log('📸 NightCrawler: No jobs found. Taking debug screenshot...');
                try {
                    await page.screenshot({ path: 'debug_last_scrape.png', fullPage: false });
                } catch (e) {
                    console.error('Error taking screenshot:', e);
                }
            }

            return allJobs;

        } catch (error) {
            console.error(`❌ NightCrawler: Error scraping ${url}:`, error.message);
            // Return whatever we found so far instead of failing completely
            return allJobs.length > 0 ? allJobs : [];
        }
    }

    /**
     * Helper to extract jobs from current page state
     */
    async extractJobsFromView(page, sourceUrl, companyId) {
        // Extract all links and text content
        const pageData = await page.evaluate(() => {
            const results = [];

            // Get all anchor tags
            const links = document.querySelectorAll('a');
            links.forEach(link => {
                const href = link.href;
                const text = link.textContent.trim();
                if (href && text && text.length > 2) {
                    results.push({ title: text, link: href, type: 'link' });
                }
            });

            // Get job-related divs/cards
            const jobContainers = document.querySelectorAll(
                '[class*="job"], [class*="career"], [class*="position"], [class*="opening"], li'
            );

            jobContainers.forEach(container => {
                const link = container.querySelector('a');
                const titleEl = container.querySelector('h1, h2, h3, h4, .title, [class*="title"], [role="heading"]');
                const locationEl = container.querySelector('[class*="location"]');

                if (link && titleEl) {
                    results.push({
                        title: titleEl.textContent.trim(),
                        link: link.href,
                        location: locationEl ? locationEl.textContent.trim() : '',
                        type: 'card'
                    });
                }
            });

            return results;
        });

        // Filter and Format
        const jobs = [];
        for (const item of pageData) {
            // Include ALL valid-looking jobs initially
            // We'll let AI or Regex decide
            jobs.push({
                title: item.title,
                link: item.link,
                location: item.location || 'Not specified',
                company: '',
                sourceUrl: sourceUrl,
                companyId: companyId,
                keywords: [] // Will be populated by fallback if used, or ignored
            });
        }
        return jobs;
    }

    /**
     * Handle Pagination Logic
     * Returns true if navigation/scroll occurred, false if no more pages
     */
    async handlePagination(page) {
        console.log('🔄 NightCrawler: Checking for next page...');

        const findNextButton = async (page) => {
            const selectors = [
                '[aria-label="Next"]',           // Common in Workday/Taleo
                '[aria-label="Next Page"]',
                'button[aria-label="next"]',
                '.next',                         // Common class name
                '.pagination-next',
                "//a[contains(., '>')]",         // Xpath for symbol
                "//button[contains(., '>')]",
                "text/Next",                      // Fallback to text
                "text/>",                         // Fallback to symbol text
                '[rel="next"]'
            ];

            for (const selector of selectors) {
                try {
                    // Handle XPath (starts with //) vs CSS Selectors vs Text
                    let element;
                    if (selector.startsWith('//')) {
                        const elements = await page.$x(selector);
                        element = elements.length > 0 ? elements[0] : null;
                    } else if (selector.startsWith('text/')) {
                        const text = selector.replace('text/', '');
                        // Puppeteer XPath for text containment
                        const elements = await page.$x(`//*[contains(text(), '${text}')]`);
                        // Filter for clickable elements prefers logic elsewhere but this is a decent fallback finder
                        // Better to look for specific tags with text
                        const linkElements = await page.$x(`//a[contains(text(), '${text}')]`);
                        const btnElements = await page.$x(`//button[contains(text(), '${text}')]`);
                        element = linkElements[0] || btnElements[0] || elements[0];
                    } else {
                        element = await page.$(selector);
                    }

                    if (element) {
                        // Verify it's not disabled
                        const isDisabled = await page.evaluate(el =>
                            el.hasAttribute('disabled') ||
                            el.classList.contains('disabled') ||
                            el.getAttribute('aria-disabled') === 'true',
                            element
                        );

                        // Check visibility
                        const isVisible = await page.evaluate(el => {
                            const style = window.getComputedStyle(el);
                            return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetWidth > 0;
                        }, element);

                        if (!isDisabled && isVisible) {
                            console.log(`   ➡️ Found Next button: ${selector}`);
                            return element;
                        }
                    }
                } catch (e) { continue; }
            }
            return null;
        };

        const nextButton = await findNextButton(page);

        if (nextButton) {
            try {
                await Promise.all([
                    // page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {}),
                    nextButton.click()
                ]);

                // Wait for content update manually since navigation might be AJAX
                await this.randomDelay(2, 4);
                return true;
            } catch (error) {
                console.error('   ❌ Error clicking Next:', error.message);
            }
        }

        // Strategy B: Infinite Scroll
        console.log('📜 NightCrawler: No "Next" button, attempting Infinite Scroll...');

        try {
            const previousHeight = await page.evaluate('document.body.scrollHeight');
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await this.randomDelay(2, 4);
            const newHeight = await page.evaluate('document.body.scrollHeight');

            if (newHeight > previousHeight) {
                console.log('   📜 Infinite scroll successful.');
                return true;
            }
        } catch (e) {
            console.error('   ❌ Infinite scroll error:', e.message);
        }

        return false;
    }

    /**
     * Extract company name from URL
     */
    extractCompanyFromUrl(url) {
        try {
            const hostname = new URL(url).hostname;
            // Remove www. and common TLDs
            const company = hostname
                .replace(/^www\./, '')
                .replace(/\.(com|org|io|net|co|careers|jobs).*$/, '');

            // Capitalize first letter
            return company.charAt(0).toUpperCase() + company.slice(1);
        } catch {
            return 'Unknown';
        }
    }

    /**
     * Save jobs to database with deduplication
     */
    async saveJobs(jobs, companyName) {
        let savedCount = 0;

        for (const job of jobs) {
            try {
                // Check if job already exists
                const existingJob = await Job.findOne({ link: job.link });

                if (!existingJob) {
                    await Job.create({
                        title: job.title,
                        company: companyName,
                        companyId: job.companyId,
                        link: job.link,
                        location: job.location,
                        sourceUrl: job.sourceUrl,
                        keywords: job.keywords,
                        isFresh: true,
                        detectedAt: new Date()
                    });
                    savedCount++;
                    console.log(`💾 NightCrawler: Saved new job - ${job.title} at ${companyName}`);
                } else {
                    // Start: Logic for "Reviving/Adopting" jobs if Company was re-added
                    // If the existing job belongs to a different companyId (or null/undefined), update it
                    if (!existingJob.companyId || existingJob.companyId.toString() !== job.companyId.toString()) {
                        console.log(`♻️ NightCrawler: Adopting orphan job - ${job.title} to ${companyName}`);
                        existingJob.companyId = job.companyId;
                        existingJob.company = companyName;
                        existingJob.isFresh = true; // Make it pop up again
                        existingJob.detectedAt = new Date(); // Bump time to top of list
                        await existingJob.save();
                        savedCount++;
                    }
                }
            } catch (error) {
                // Likely duplicate key error, skip silently
                if (error.code !== 11000) {
                    console.error(`⚠️ NightCrawler: Error saving job:`, error.message);
                }
            }
        }

        return savedCount;
    }

    /**
     * Main crawl execution - runs a full batch
     */
    async runBatch(triggerType = 'scheduled') {
        if (this.isRunning) {
            console.log('⚠️ NightCrawler: Already running, skipping...');
            return null;
        }

        this.isRunning = true;
        const startTime = Date.now();

        // Create log entry
        const log = await CrawlerLog.create({
            batchTime: new Date(),
            status: 'running',
            triggerType
        });

        console.log('🌙 NightCrawler: Starting batch crawl (Company-Centric)...');

        try {
            // Get Global Settings
            const settings = await Settings.getSettings();

            // Get All Companies
            const companies = await Company.find({ isActive: true });

            if (companies.length === 0) {
                console.log('⚠️ NightCrawler: No companies configured, skipping...');
                log.status = 'completed';
                log.duration = Date.now() - startTime;
                await log.save();
                this.isRunning = false;
                return log;
            }

            // Initialize browser
            await this.initBrowser();
            const page = await this.browser.newPage();

            // Set realistic user agent
            await page.setUserAgent(
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            );

            // Set viewport
            await page.setViewport({ width: 1920, height: 1080 });

            let totalJobsFound = 0;
            let companiesScanned = 0;

            // Iterate Companies
            for (const company of companies) {
                companiesScanned++;
                console.log(`\n🏢 NightCrawler: Processing Company ${companiesScanned}/${companies.length}: ${company.name}`);

                // Determine Keywords: Only needed for Fallback, deferred.
                // const targetRoles = ... (Moved to catch block)

                // Iterate URLs for this company
                for (const url of company.urls) {
                    if (!url) continue;

                    try {
                        console.log(`   📍 URL: ${url}`);

                        const rawJobs = await this.scrapePage(
                            page,
                            url,
                            company._id // Pass Company ID
                        );

                        console.log(`   🔍 Found ${rawJobs.length} raw jobs, running AI Filter...`);

                        let filteredJobs = [];

                        // AI FILTER with Regex Fallback
                        try {
                            const persona = company.customPersona && company.customPersona.trim().length > 0
                                ? company.customPersona
                                : settings.userPersona;

                            filteredJobs = await AIFilter.filterJobs(rawJobs, persona);
                            console.log(`   🤖 AI Filter Approved: ${filteredJobs.length}/${rawJobs.length}`);
                        } catch (aiError) {
                            console.error('   ❌ AI Filter failed, falling back to Regex:', aiError.message);

                            // FALLBACK: Load tags only if AI fails
                            const fallbackTags = (company.customTags && company.customTags.length > 0)
                                ? company.customTags
                                : settings.defaultTags;

                            console.log(`   ⚠️ Using Regex Fallback with tags: ${fallbackTags.join(', ')}`);

                            filteredJobs = rawJobs.filter(job => this.matchesKeywords(job.title, fallbackTags));
                            console.log(`   ⚠️ Regex Fallback Approved: ${filteredJobs.length}/${rawJobs.length}`);
                        }

                        // If AI returns 0 but regex would have returned something (Safety Check?)
                        // For now trust AI, but maybe good to log divergence? 

                        if (filteredJobs.length === 0 && rawJobs.length > 0) {
                            console.log('   ⚠️ No jobs matched criteria.');
                        }

                        const savedCount = await this.saveJobs(filteredJobs, company.name);
                        totalJobsFound += savedCount;

                    } catch (error) {
                        console.error(`❌ NightCrawler: Failed to scrape ${url}:`, error.message);
                        log.crawlErrors.push({
                            url,
                            message: `${company.name}: ${error.message}`,
                            timestamp: new Date()
                        });
                    }

                    // Delay between URLs of same company (small)
                    await this.randomDelay(2, 5);
                }

                // Global Delay between companies (larger)
                if (companiesScanned < companies.length) {
                    const waitMinutes = Math.floor(Math.random() * 2) + 1;
                    console.log(`😴 NightCrawler: Sleeping ${waitMinutes} minute(s) before next company...`);
                    await this.randomDelay(waitMinutes * 60, waitMinutes * 60 + 30);
                }
            }

            // Update log with results
            log.urlsScanned = companiesScanned;
            log.jobsFound = totalJobsFound;
            log.status = 'completed';
            log.duration = Date.now() - startTime;
            await log.save();

            console.log(`\n🎉 NightCrawler: Batch complete!`);
            console.log(`   🏢 Companies scanned: ${companiesScanned}`);
            console.log(`   💼 New jobs found: ${totalJobsFound}`);
            console.log(`   ⏱️ Duration: ${Math.round(log.duration / 1000)}s`);
            console.log(`   ❌ Errors: ${log.crawlErrors.length}`);

            return log;

        } catch (error) {
            console.error('❌ NightCrawler: Batch failed:', error.message);

            log.status = 'failed';
            log.crawlErrors.push({
                url: 'BATCH',
                message: error.message,
                timestamp: new Date()
            });
            log.duration = Date.now() - startTime;
            await log.save();

            throw error;

        } finally {
            // CRITICAL: Always close browser to prevent memory leaks
            await this.closeBrowser();
            this.isRunning = false;
        }
    }

    /**
     * Get current running status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            hasBrowser: !!this.browser
        };
    }
}

// Export singleton instance
module.exports = new NightCrawler();
