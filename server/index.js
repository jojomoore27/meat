import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Routes
import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orderRequests.js';
import wholesaleRoutes from './routes/wholesaleRequests.js';
import contactRoutes from './routes/contact.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import galleryRoutes from './routes/gallery.js';
import faqRoutes from './routes/faqs.js';
import testimonialRoutes from './routes/testimonials.js';
import cmsRoutes from './routes/cms.js';
import notificationRoutes from './routes/notifications.js';
import mediaRoutes from './routes/media.js';
import dashboardRoutes from './routes/dashboard.js';

// Middleware & DB
import { sanitizeBody } from './middleware/validator.js';
import { errorHandler } from './middleware/errorHandler.js';
import { seedDatabase } from './database/seed.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers (configured to allow external image CDNs like Unsplash and Google Fonts)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:', 'https://images.unsplash.com', 'https://*.supabase.co'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'", 'https://*.supabase.co', 'https://api.telegram.org', 'https://graph.facebook.com'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);

// Body Parsers & Sanitizer
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeBody);

// Serve static uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'BestGrassFedCattle API Server',
    version: '1.0.0'
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/order-requests', orderRoutes);
app.use('/api/wholesale-requests', wholesaleRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);

// Centralized Error Handling
app.use(errorHandler);

// Bootstrap Server & DB
async function startServer() {
  try {
    console.log('📦 Bootstrapping database...');
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 BestGrassFedCattle Server running on http://localhost:${PORT}`);
      console.log(`🛡️ Rate limiting and security filters active.`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
