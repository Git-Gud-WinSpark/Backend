const rateLimit = require('express-rate-limit'); // Correct import

const limiter = rateLimit({
    windowMs: 30 * 1000, // 15 minutes
    max: 5, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = limiter;