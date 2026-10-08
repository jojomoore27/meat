import { query, queryOne } from '../config/db.js';
import { initializeDatabase } from './init.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function seedDatabase() {
  await initializeDatabase();
  console.log('🌱 Seeding database with authentic cattle farm content...');

  // 1. Seed Admin
  const existingAdmin = await queryOne('SELECT * FROM admins WHERE username = $1', ['admin']);
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash('Password123!', 12);
    await query(
      'INSERT INTO admins (id, username, email, password_hash, role) VALUES ($1, $2, $3, $4, $5)',
      [uuidv4(), 'admin', 'admin@bestgrassfedcattle.com', passwordHash, 'superadmin']
    );
    console.log('👤 Admin user seeded: admin / Password123!');
  }

  // 2. Seed Categories (18 Specific Cuts)
  const categoriesData = [
    { name: 'T-Bone / Porterhouse (tenderloin incl.)', slug: 't-bone-porterhouse', description: 'Prime bone-in T-Bone and Porterhouse cuts with tenderloin included.', sort_order: 1 },
    { name: 'New York Strip Steaks', slug: 'new-york-strip-steaks', description: 'Tender, robustly marbled New York strip steaks dry-aged for rich flavor.', sort_order: 2 },
    { name: 'Sirloin Steaks', slug: 'sirloin-steaks', description: 'Lean, intensely flavorful top sirloin steaks cut fresh from pasture cattle.', sort_order: 3 },
    { name: 'Round Steaks', slug: 'round-steaks', description: 'Lean, versatile round steaks excellent for marinating, searing, and braising.', sort_order: 4 },
    { name: 'Flat Iron / Chuck Steaks', slug: 'flat-iron-chuck-steaks', description: 'Exceptionally tender flat iron and artisanal chuck steaks with rich marbling.', sort_order: 5 },
    { name: 'Flank / Skirt Steak', slug: 'flank-skirt-steak', description: 'Prized chef cuts with distinct grain, phenomenal sear, and deep pasture umami.', sort_order: 6 },
    { name: 'Chuck Roasts', slug: 'chuck-roasts', description: 'Classic well-marbled chuck roasts perfect for slow braising and pot roasts.', sort_order: 7 },
    { name: 'Rump / Round Roasts', slug: 'rump-round-roasts', description: 'Traditional lean roasts ideal for slow roasting, slicing thin, or deli roast beef.', sort_order: 8 },
    { name: 'Brisket', slug: 'brisket', description: 'Whole packer and flat briskets rich in collagen for low-and-slow barbecue smoking.', sort_order: 9 },
    { name: 'Short Ribs', slug: 'short-ribs', description: 'English and flanken cut short ribs with dense marbling for succulent braises.', sort_order: 10 },
    { name: 'Stew Meat / Kabob Cubes', slug: 'stew-meat-kabob-cubes', description: 'Hand-trimmed bite-sized cubes for hearty stews, chili, and campfire skewers.', sort_order: 11 },
    { name: 'Shank (Osso Buco)', slug: 'shank-osso-buco', description: 'Cross-cut center beef shanks with marrow bone for gourmet Osso Buco.', sort_order: 12 },
    { name: 'Soup Bones / Oxtail', slug: 'soup-bones-oxtail', description: 'Dense marrow bones and gelatin-rich oxtail for collagen broths and hearty soups.', sort_order: 13 },
    { name: 'Ground Beef', slug: 'ground-beef', description: 'Pure 100% grass-fed ground beef in balanced lean-to-fat pasture ratio.', sort_order: 14 },
    { name: 'Liver', slug: 'liver', description: 'Nutrient-dense, iron-rich fresh beef liver from 100% pasture-grazed cattle.', sort_order: 15 },
    { name: 'Heart', slug: 'heart', description: 'Lean, clean beef heart rich in CoQ10, minerals, and restorative nutrients.', sort_order: 16 },
    { name: 'Tongue', slug: 'tongue', description: 'Tender, flavorful delicacy cut suitable for slow cooking and artisanal tacos.', sort_order: 17 },
    { name: 'Suet / Tallow', slug: 'suet-tallow', description: 'Pure kidney suet and rendering-grade fat for rich cooking tallow and skincare.', sort_order: 18 }
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    let existing = await queryOne('SELECT * FROM categories WHERE slug = $1', [cat.slug]);
    if (!existing) {
      const id = uuidv4();
      await query(
        'INSERT INTO categories (id, name, slug, description, sort_order, is_active) VALUES ($1, $2, $3, $4, $5, 1)',
        [id, cat.name, cat.slug, cat.description, cat.sort_order]
      );
      categoryMap[cat.slug] = id;
    } else {
      categoryMap[cat.slug] = existing.id;
    }
  }

  // 3. Seed Products
  const productsData = [
    {
      name: 'Dry-Aged Ribeye Steak',
      slug: 'dry-aged-ribeye-steak',
      sku: 'BGC-RIB-001',
      categorySlug: 't-bone-porterhouse',
      price: 34.50,
      short_description: '21-day dry aged, rich pasture marbling, intensely flavorful and tender.',
      full_description: 'Our signature cut. Raised entirely on upstate New York pastures with zero grain, hormones, or feedlot confinement. Aged 21 days for maximum concentration of umami and tenderness. Best prepared in a cast-iron skillet with rosemary and pasture butter.',
      main_image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80',
      additional_images: JSON.stringify([
        'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80'
      ]),
      status: 'published',
      is_featured: 1,
      cut_options: JSON.stringify([]),
      specifications: JSON.stringify({}),
      seo_title: '100% Grass-Fed Dry-Aged Ribeye Steak | BestGrassFedCattle',
      seo_description: 'Order authentic 21-day dry aged grass-fed ribeye steak from our New York farm.'
    },
    {
      name: 'New York Strip Steak',
      slug: 'new-york-strip-steak',
      sku: 'BGC-NYS-002',
      categorySlug: 'new-york-strip-steaks',
      price: 31.00,
      short_description: 'Classic American strip steak with clean, robust beef flavor and fine marbling.',
      full_description: 'Hand-trimmed from the short loin, our New York Strip embodies what authentic grass-fed beef tastes like: clean, mineral-rich, robustly beefy with a delicate fat cap that renders beautifully under high heat.',
      main_image: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=800&q=80',
      additional_images: JSON.stringify([]),
      status: 'published',
      is_featured: 1,
      cut_options: JSON.stringify([]),
      specifications: JSON.stringify({}),
      seo_title: 'Grass-Fed New York Strip Steak | BestGrassFedCattle',
      seo_description: 'Artisanal grass-fed New York Strip steak from New York pastures.'
    },
    {
      name: 'Pasture-Raised Filet Mignon',
      slug: 'pasture-raised-filet-mignon',
      sku: 'BGC-FIL-003',
      categorySlug: 't-bone-porterhouse',
      price: 42.00,
      short_description: 'Melt-in-your-mouth tenderness, center-cut tenderloin with delicate sweetness.',
      full_description: 'The most tender muscle in the steer. Because our cattle roam freely on lush clover and rye pastures, this tenderloin develops an extraordinary clean, sweet flavor profile without the muddy taste of conventional feedlot beef.',
      main_image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      additional_images: JSON.stringify([]),
      status: 'published',
      is_featured: 1,
      cut_options: JSON.stringify([]),
      specifications: JSON.stringify({}),
      seo_title: 'Pasture-Raised Filet Mignon | BestGrassFedCattle',
      seo_description: 'Center-cut grass-fed filet mignon tenderloin.'
    },
    {
      name: '100% Grass-Fed Ground Beef (85/15)',
      slug: 'grass-fed-ground-beef-85-15',
      sku: 'BGC-GRD-004',
      categorySlug: 'ground-beef',
      price: 11.50,
      short_description: 'Freshly ground coarse blend of brisket, chuck, and round. Pure and versatile.',
      full_description: 'Ground only from whole muscle cuts of our pasture-raised cattle. No fillers, no trimmings, no ammonia washes. Perfect for artisan burgers, bolognese, chili, and weeknight family dinners.',
      main_image: 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=800&q=80',
      additional_images: JSON.stringify([]),
      status: 'published',
      is_featured: 1,
      cut_options: JSON.stringify([]),
      specifications: JSON.stringify({}),
      seo_title: '100% Grass-Fed Ground Beef 85/15 | BestGrassFedCattle',
      seo_description: 'Pure pasture-raised grass-fed ground beef.'
    },
    {
      name: 'Heritage Chuck Pot Roast',
      slug: 'heritage-chuck-pot-roast',
      sku: 'BGC-CHK-005',
      categorySlug: 'chuck-roasts',
      price: 18.00,
      short_description: 'Generously marbled shoulder cut, transforms into fork-tender richness when braised.',
      full_description: 'The centerpiece of Sunday dinners. Abundant connective tissue that gently dissolves into gelatin during slow simmering with root vegetables, red wine, and farm thyme.',
      main_image: 'https://images.unsplash.com/photo-1588347818036-558601350947?auto=format&fit=crop&w=800&q=80',
      additional_images: JSON.stringify([]),
      status: 'published',
      is_featured: 0,
      cut_options: JSON.stringify([]),
      specifications: JSON.stringify({}),
      seo_title: 'Grass-Fed Chuck Pot Roast | BestGrassFedCattle',
      seo_description: 'Slow-braised heritage grass-fed chuck roast.'
    },
    {
      name: 'English Cut Short Ribs',
      slug: 'english-cut-short-ribs',
      sku: 'BGC-RIB-006',
      categorySlug: 'short-ribs',
      price: 22.00,
      short_description: 'Thick, meaty bone-in short ribs with deep beef richness.',
      full_description: 'Cut across the rib bone into generous 3-inch portions. When braised in stock and herbs, the meat falls away effortlessly from the bone, offering unmatched richness and collagen.',
      main_image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
      additional_images: JSON.stringify([]),
      status: 'published',
      is_featured: 0,
      cut_options: JSON.stringify([]),
      specifications: JSON.stringify({}),
      seo_title: 'English Cut Grass-Fed Short Ribs | BestGrassFedCattle',
      seo_description: 'Bone-in artisanal grass-fed short ribs.'
    },
    {
      name: 'Artisan Beef Marrow Bones & Oxtail Pack',
      slug: 'beef-marrow-bones-oxtail-pack',
      sku: 'BGC-BON-007',
      categorySlug: 'soup-bones-oxtail',
      price: 14.00,
      short_description: 'Femur pipe bones and collagen-rich oxtail for deep, gelatinous bone broths.',
      full_description: 'Grass-fed bones yield broth with exceptional depth, golden fat, and high collagen density. Roast first for caramelized richness before a 24-hour slow simmer.',
      main_image: '/images/artisanal_ribeye_steak.jpg',
      additional_images: JSON.stringify([]),
      status: 'published',
      is_featured: 0,
      cut_options: JSON.stringify([]),
      specifications: JSON.stringify({}),
      seo_title: 'Grass-Fed Marrow Bones & Oxtail | BestGrassFedCattle',
      seo_description: 'Nutrient-dense grass-fed marrow bones for roasting and broths.'
    },
    {
      name: 'Quarter Beef Share (Bulk Reserve)',
      slug: 'quarter-beef-share-bulk',
      sku: 'BGC-BLK-008',
      categorySlug: 'stew-meat-kabob-cubes',
      price: 1250.00,
      short_description: 'Approx 100-110 lbs of packaged beef: steaks, roasts, ground beef, and ribs.',
      full_description: 'Our most economical option for families and serious food lovers. A balanced assortment of prime steaks (Ribeye, Strip, Filet), roasts (Chuck, Brisket, Sirloin Tip), braising cuts, and ground beef. Custom cut specifications available upon inquiry.',
      main_image: '/images/farmer_cattle_field.jpg',
      additional_images: JSON.stringify([]),
      status: 'published',
      is_featured: 1,
      cut_options: JSON.stringify([]),
      specifications: JSON.stringify({}),
      seo_title: 'Quarter Beef Share (Bulk Order) | BestGrassFedCattle',
      seo_description: 'Direct farm quarter beef share reserve.'
    }
  ];

  for (const prod of productsData) {
    const existing = await queryOne('SELECT * FROM products WHERE slug = $1', [prod.slug]);
    const catId = categoryMap[prod.categorySlug] || null;
    if (!existing) {
      await query(
        `INSERT INTO products (
          id, name, slug, sku, category_id, price, short_description, full_description,
          main_image, additional_images, status, is_featured, cut_options, specifications,
          seo_title, seo_description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          uuidv4(), prod.name, prod.slug, prod.sku, catId, prod.price,
          prod.short_description, prod.full_description, prod.main_image,
          prod.additional_images, prod.status, prod.is_featured, prod.cut_options,
          prod.specifications, prod.seo_title, prod.seo_description
        ]
      );
    }
  }

  // 4. Seed FAQs
  const faqsData = [
    {
      question: 'How does the ordering process work without an online checkout?',
      answer: 'BestGrassFedCattle operates on an authentic direct relationship model. When you click "ORDER THIS ITEM", you submit an order request with your desired quantity, cut thickness, and contact preference. Our farm team reviews our freshly prepared stock, reaches out to you directly via your chosen method (phone, email, WhatsApp, or Telegram) to confirm availability and logistics, and finalizes the order personally.',
      category: 'Ordering & Requests',
      sort_order: 1
    },
    {
      question: 'What does 100% Grass-Fed and Grass-Finished mean?',
      answer: 'Our cattle spend their entire lives grazing open New York pastures on a natural rotational diet of clover, orchard grass, and timothy. Unlike industrial beef, our cattle never step foot in a feedlot and are never fed grains, corn silage, antibiotics, or synthetic growth hormones.',
      category: 'Beef & Agriculture',
      sort_order: 2
    },
    {
      question: 'How do Bulk & Wholesale orders work for restaurants and butchers?',
      answer: 'Commercial establishments, caterers, and private clubs can visit our Bulk & Wholesale page to submit volume requirements (quarter steers, half steers, whole carcasses, or bulk ground beef). Our wholesale director will respond within 24 hours with wholesale volume schedules and cut sheet sheets.',
      category: 'Wholesale & B2B',
      sort_order: 3
    },
    {
      question: 'Can I request custom cut thicknesses or bone-in options?',
      answer: 'Yes! When submitting an order request for steaks or roasts, select your preferred thickness or specify custom requirements in the "Special Instructions" box. Our butcher cuts to order.',
      category: 'Cuts & Butchery',
      sort_order: 4
    }
  ];

  for (const faq of faqsData) {
    const existing = await queryOne('SELECT * FROM faqs WHERE question = $1', [faq.question]);
    if (!existing) {
      await query(
        'INSERT INTO faqs (id, question, answer, category, sort_order, is_published) VALUES ($1, $2, $3, $4, $5, 1)',
        [uuidv4(), faq.question, faq.answer, faq.category, faq.sort_order]
      );
    }
  }

  // 5. Seed Testimonials
  const testimonialsData = [
    {
      customer_name: 'Executive Chef Marcus Vance',
      customer_role: 'Manhattan Farm-to-Table Hospitality Group',
      quote: 'The marbling and mineral clean finish on BestGrassFedCattle’s ribeye cuts set a new standard for our steak program. Our guests notice the difference immediately.',
      photo_url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=400&q=80',
      is_featured: 1,
      sort_order: 1
    },
    {
      customer_name: 'Sarah & David Jenkins',
      customer_role: 'Quarter Share Beef Customer (Westchester, NY)',
      quote: 'We ordered a quarter beef share for our deep freezer. Every single cut—from the ground beef to the tenderloin roasts—has been exceptional. The direct communication made everything seamless.',
      photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      is_featured: 1,
      sort_order: 2
    }
  ];

  for (const t of testimonialsData) {
    const existing = await queryOne('SELECT * FROM testimonials WHERE customer_name = $1', [t.customer_name]);
    if (!existing) {
      await query(
        'INSERT INTO testimonials (id, customer_name, customer_role, quote, photo_url, is_featured, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [uuidv4(), t.customer_name, t.customer_role, t.quote, t.photo_url, t.is_featured, t.sort_order]
      );
    }
  }

  // 6. Seed Gallery
  const galleryData = [
    { title: 'Black Angus Cattle Grazing in Morning Pasture', category: 'cattle', url: '/images/hero_cattle_pasture.jpg', is_featured: 1, sort: 1 },
    { title: 'Rolling Upstate New York Clover & Grasslands', category: 'grassland', url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1200&q=80', is_featured: 1, sort: 2 },
    { title: 'Artisanal Dry-Aged Ribeye Hand Trimmed', category: 'beef', url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=1200&q=80', is_featured: 1, sort: 3 },
    { title: 'Pasture Management & Rotational Fencing', category: 'farm', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80', is_featured: 0, sort: 4 },
    { title: 'Cattle Herd Grazing at Golden Hour', category: 'cattle', url: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?auto=format&fit=crop&w=1200&q=80', is_featured: 1, sort: 5 },
    { title: 'Butcher Cut Inspection & Marbling Check', category: 'behind_scenes', url: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=1200&q=80', is_featured: 0, sort: 6 }
  ];

  for (const g of galleryData) {
    const existing = await queryOne('SELECT * FROM gallery_images WHERE title = $1', [g.title]);
    if (!existing) {
      await query(
        'INSERT INTO gallery_images (id, title, image_url, category, is_featured, sort_order) VALUES ($1, $2, $3, $4, $5, $6)',
        [uuidv4(), g.title, g.url, g.category, g.is_featured, g.sort]
      );
    }
  }

  // 7. Seed Site Settings
  const existingSettings = await queryOne('SELECT * FROM site_settings WHERE id = $1', ['default']);
  if (!existingSettings) {
    await query(`
      INSERT INTO site_settings (
        id, business_name, tagline, location, currency, contact_email, contact_phone, address,
        social_links, brand_description, theme_default
      ) VALUES (
        'default',
        'BestGrassFedCattle',
        'Premium Grass-Fed Beef, Raised With Purpose.',
        'New York, United States',
        'USD ($)',
        'grassfed@gmail.com',
        '+1 (305) 213-2655',
        'Upstate New York Pastures, United States',
        '{"instagram":"https://instagram.com/bestgrassfedcattle","facebook":"https://facebook.com/bestgrassfedcattle"}',
        'Ethically raised 100% grass-fed and grass-finished cattle from pristine New York pastures. Direct order requests and wholesale arrangements.',
        'system'
      )
    `);
  }

  // 8. Seed Notification Settings
  const existingNotif = await queryOne('SELECT * FROM notification_settings WHERE id = $1', ['default']);
  if (!existingNotif) {
    await query(`
      INSERT INTO notification_settings (
        id, admin_dashboard_enabled, email_enabled, email_recipient,
        telegram_enabled, whatsapp_enabled, livechat_enabled
      ) VALUES (
        'default', 1, 0, 'grassfed@gmail.com', 0, 0, 0
      )
    `);
  }

  // 9. Seed Sample CMS Content for Live Editing
  const cmsSections = [
    {
      id: 'home_hero',
      page_key: 'home',
      section_key: 'hero',
      content_json: JSON.stringify({
        headline: 'Premium Grass-Fed Beef, Raised With Purpose.',
        subheadline: 'Quality beef from carefully raised cattle in New York, presented with the care and standards customers expect from a premium American beef brand.',
        ctaPrimaryText: 'Explore Our Beef',
        ctaSecondaryText: 'Order Beef',
        heroImage: '/images/hero_cattle_pasture.jpg'
      })
    },
    {
      id: 'home_trust',
      page_key: 'home',
      section_key: 'trust',
      content_json: JSON.stringify({
        badge1_title: '100% Grass-Fed Focus',
        badge1_desc: 'Rotational grazing on pristine New York clover and rye pastures.',
        badge2_title: 'Carefully Selected Beef',
        badge2_desc: 'Meticulously dry-aged and hand-trimmed artisanal cuts.',
        badge3_title: 'Direct Farm Relationship',
        badge3_desc: 'Zero retail middlemen; personal consultation on every cut.',
        badge4_title: 'Bulk & Wholesale Ready',
        badge4_desc: 'Equipped to serve restaurants, butchers, and private quarters.'
      })
    }
  ];

  for (const c of cmsSections) {
    const existing = await queryOne('SELECT * FROM cms_content WHERE id = $1', [c.id]);
    if (!existing) {
      await query(
        'INSERT INTO cms_content (id, page_key, section_key, content_json) VALUES ($1, $2, $3, $4)',
        [c.id, c.page_key, c.section_key, c.content_json]
      );
    }
  }

  console.log('✅ Seeding complete.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
