import rateLimit from 'express-rate-limit';

// Rate limiter for public order requests, wholesale, and contact forms
export const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 submissions per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests submitted from this IP address. Please wait a few minutes or contact us directly.'
  }
});

// Rate limiter for admin login to prevent brute force
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8, // 8 attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many login attempts. For security reasons, please wait 15 minutes before trying again.'
  }
});
