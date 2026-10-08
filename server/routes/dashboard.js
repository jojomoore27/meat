import express from 'express';
import { query, queryOne } from '../config/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', requireAdmin, async (req, res, next) => {
  try {
    const newOrders = await queryOne("SELECT COUNT(*) as count FROM order_requests WHERE status = 'new'");
    const totalOrders = await queryOne('SELECT COUNT(*) as count FROM order_requests');
    const newWholesale = await queryOne("SELECT COUNT(*) as count FROM wholesale_requests WHERE status = 'new'");
    const totalWholesale = await queryOne('SELECT COUNT(*) as count FROM wholesale_requests');
    const unreadMessages = await queryOne('SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0');
    const totalProducts = await queryOne('SELECT COUNT(*) as count FROM products');
    const publishedProducts = await queryOne("SELECT COUNT(*) as count FROM products WHERE status = 'published'");
    const totalGallery = await queryOne('SELECT COUNT(*) as count FROM gallery_images');
    const totalTestimonials = await queryOne('SELECT COUNT(*) as count FROM testimonials');

    const recentOrders = await query('SELECT * FROM order_requests ORDER BY created_at DESC LIMIT 5');
    const recentWholesale = await query('SELECT * FROM wholesale_requests ORDER BY created_at DESC LIMIT 5');
    const recentMessages = await query('SELECT * FROM contact_messages ORDER BY created_at DESC LIMIT 5');

    res.json({
      success: true,
      stats: {
        newOrders: Number(newOrders?.count) || 0,
        totalOrders: Number(totalOrders?.count) || 0,
        newWholesale: Number(newWholesale?.count) || 0,
        totalWholesale: Number(totalWholesale?.count) || 0,
        unreadMessages: Number(unreadMessages?.count) || 0,
        totalProducts: Number(totalProducts?.count) || 0,
        publishedProducts: Number(publishedProducts?.count) || 0,
        totalGallery: Number(totalGallery?.count) || 0,
        totalTestimonials: Number(totalTestimonials?.count) || 0,
      },
      recentOrders: recentOrders.rows,
      recentWholesale: recentWholesale.rows,
      recentMessages: recentMessages.rows,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
