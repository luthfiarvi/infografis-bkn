const express = require('express');
const router = express.Router();
const infographicController = require('../controllers/infographicController');
const { ensureAuthenticated } = require('../middleware/authMiddleware');
const { uploadEvidence } = require('../middleware/uploadMiddleware');

// Portal & Options (protected)
router.get('/', ensureAuthenticated, infographicController.getPortal);
router.get('/portal', ensureAuthenticated, infographicController.getPortal);
router.get('/dashboard', ensureAuthenticated, infographicController.getPortal);
router.get('/notulen', ensureAuthenticated, infographicController.getNotulen);

// Generator (Infographics)
router.get('/generator', ensureAuthenticated, infographicController.getGenerator);

// History & standalone preview
router.get('/history', ensureAuthenticated, infographicController.getHistory);
router.get('/preview/:id', ensureAuthenticated, infographicController.getPreview);

// API routes for saving, deletion, AI generation, and evidence upload
router.post('/api/infographics', ensureAuthenticated, infographicController.saveInfographic);
router.delete('/api/infographics/:id', ensureAuthenticated, infographicController.deleteInfographic);
router.post('/api/ai-generate', ensureAuthenticated, infographicController.aiGenerate);
router.post('/api/upload-evidence', ensureAuthenticated, uploadEvidence.single('file'), infographicController.uploadEvidenceFile);

module.exports = router;
