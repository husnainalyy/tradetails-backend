const express = require('express');
const { handleWebhook } = require('../controllers/webhookController');

const router = express.Router();

// Webhook endpoint
router.post('/webhooks/clerk', handleWebhook);

module.exports = router;
