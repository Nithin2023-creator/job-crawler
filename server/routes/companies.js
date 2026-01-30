const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Job = require('../models/Job');

// GET all companies
router.get('/', async (req, res) => {
    try {
        const companies = await Company.find().lean();

        // Add job counts
        // Note: For large datasets, this might be slow. Consider caching or aggregating.
        // For now, it's fine.
        const companiesWithCounts = await Promise.all(companies.map(async (company) => {
            const jobCount = await Job.countDocuments({ companyId: company._id, isNew: true }); // Count "New" jobs? Or all? User req says "Badge: Red counter showing X New Jobs". Assuming isFresh/isNew equivalent? 
            // In Job schema we have isFresh (Boolean). User prompt said "isNew: Boolean (True until viewed)". 
            // My Job schema uses `isFresh`. I should probably stick to `isFresh` or map it.
            // Let's use `isFresh` for now as "New".
            return {
                ...company,
                newJobsCount: await Job.countDocuments({ companyId: company._id, isFresh: true })
            };
        }));

        res.json(companiesWithCounts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE a company
router.post('/', async (req, res) => {
    const { name, urls, customTags, customPersona, logoUrl } = req.body;
    try {
        const company = new Company({
            name,
            urls,
            customTags,
            customPersona,
            logoUrl
        });
        const newCompany = await company.save();
        res.status(201).json(newCompany);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE a company
router.put('/:id', async (req, res) => {
    try {
        console.log(`📥 PUT /api/companies/${req.params.id}`, req.body);
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        if (req.body.name) company.name = req.body.name;
        if (req.body.urls) company.urls = req.body.urls;
        if (req.body.customTags) company.customTags = req.body.customTags;
        if (req.body.customPersona !== undefined) company.customPersona = req.body.customPersona;
        if (req.body.logoUrl) company.logoUrl = req.body.logoUrl;
        if (req.body.isActive !== undefined) company.isActive = req.body.isActive;

        const updatedCompany = await company.save();
        res.json(updatedCompany);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a company
router.delete('/:id', async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Optionally delete associated jobs or keep them?
        // Usually good to keep jobs but maybe unlink? 
        // For simplicity, let's just delete the company. Jobs will have dangling references unless we cascade.
        // Let's delete jobs for now to keep it clean, or just leave them. 
        // User didn't specify cascade delete. I'll just delete the company.

        await company.deleteOne();
        res.json({ message: 'Company deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
