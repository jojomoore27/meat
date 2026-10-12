import { query, queryOne } from '../config/db.js';
import { initializeDatabase } from './init.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const SUPABASE_CDN_IMAGES = {
  tbone: 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/1791760498806_743.jpeg',
  strip: 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/1791760712306_824.jpeg',
  roast: 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/1791760535942_487.jpeg',
  liver: 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/1791760448940_685.jpeg',
  tongue: 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/1791760412733_820.jpeg',
  bones1: 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/1791760328383_39.jpeg',
  bones2: 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/1791760576218_675.jpeg'
};

export async function seedDatabase(options = {}) {
  await initializeDatabase();

  // Guard: if database already has live products or gallery, do NOT re-seed to preserve deletions and edits
  if (!options.force) {
    const existingProducts = await query('SELECT id FROM products LIMIT 1');
    const existingGallery = await query('SELECT id FROM gallery_images LIMIT 1');
    if ((existingProducts.rows && existingProducts.rows.length > 0) || (existingGallery.rows && existingGallery.rows.length > 0)) {
      console.log('ℹ️ Database already contains live content. Skipping seed to preserve deletions and custom edits.');
      return;
    }
  }

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

  // 3. Seed Products using ONLY authentic Supabase photos
  const productsData = [
    {
      name: 'Prime T-Bone / Porterhouse Steak',
      slug: 't-bone-porterhouse-steak',
      sku: 'BGC-TBN-001',
      categorySlug: 't-bone-porterhouse',
      price: 36.50,
      short_description: 'Prime bone-in T-Bone and Porterhouse cuts with tenderloin included. 100% pasture-raised.',
      full_description: 'Our premier bone-in steak featuring both the tender filet mignon and flavorful strip loin separated by the classic T-bone. Raised 100% on open Kansas pastures with zero grain, antibiotics, or hormones. Dry-aged to perfection.',
      main_image: SUPABASE_CDN_IMAGES.tbone,
      additional_images: JSON.stringify([SUPABASE_CDN_IMAGES.strip]),
      status: 'published',
      is_featured: 1,
      cut_options: JSON.stringify(['1.25 inch thick cut', '1.5 inch thick cut', '2.0 inch cowboy cut']),
      specifications: JSON.stringify({ 'Aging': '21-day dry aged', 'Feeding': '100% Grass-Fed & Finished', 'Packaging': 'Individually vacuum sealed' }),
      seo_title: '100% Grass-Fed T-Bone & Porterhouse Steak | BestGrassFedCattle',
      seo_description: 'Order authentic bone-in grass-fed T-Bone and Porterhouse steaks from our Kansas farm.'
    },
    {
      name: 'Artisanal New York Strip Steaks',
      slug: 'artisanal-new-york-strip-steaks',
      sku: 'BGC-NYS-002',
      categorySlug: 'new-york-strip-steaks',
      price: 32.00,
      short_description: 'Tender, robustly marbled New York strip steaks with distinct pasture depth.',
      full_description: 'Hand-trimmed from the short loin, our New York Strip embodies authentic grass-fed beef: clean mineral richness, fine marbling, and a delicate fat cap that crisps to golden perfection.',
      main_image: SUPABASE_CDN_IMAGES.strip,
      additional_images: JSON.stringify([SUPABASE_CDN_IMAGES.tbone]),
      status: 'published',
      is_featured: 1,
      cut_options: JSON.stringify(['1.0 inch cut', '1.25 inch cut', '1.5 inch thick cut']),
      specifications: JSON.stringify({ 'Aging': '21-day dry aged', 'Feeding': '100% Grass-Fed', 'Origin': 'Kansas, USA' }),
      seo_title: 'Grass-Fed New York Strip Steak | BestGrassFedCattle',
      seo_description: 'Pasture-raised artisanal New York Strip steaks from Kansas grasslands.'
    },
    {
      name: 'Heritage Marbled Chuck Roast',
      slug: 'heritage-marbled-chuck-roast',
      sku: 'BGC-CHK-003',
      categorySlug: 'chuck-roasts',
      price: 19.50,
      short_description: 'Generously marbled shoulder roast; renders into fork-tender richness when slow-braised.',
      full_description: 'The foundation of hearty Sunday family dinners. Rich connective tissue and natural pasture marbling gently melt into rich collagen broth during low-and-slow roasting with root herbs and garlic.',
      main_image: SUPABASE_CDN_IMAGES.roast,
      additional_images: JSON.stringify([]),
      status: 'published',
      is_featured: 1,
      cut_options: JSON.stringify(['3-4 lb Roast', '4-5 lb Roast']),
      specifications: JSON.stringify({ 'Cut': 'Shoulder Chuck', 'Recommended Cooking': 'Slow Braise, Pot Roast, Dutch Oven' }),
      seo_title: 'Grass-Fed Chuck Pot Roast | BestGrassFedCattle',
      seo_description: 'Artisanal slow-braising grass-fed chuck roast from Kansas cattle.'
    },
    {
      name: 'Pasture-Raised Fresh Beef Liver',
      slug: 'pasture-raised-fresh-beef-liver',
      sku: 'BGC-LVR-004',
      categorySlug: 'liver',
      price: 12.00,
      short_description: 'Nutrient-dense, iron-rich fresh beef liver from 100% pasture-grazed cattle.',
      full_description: 'Nature’s most concentrated superfood. Clean, sweet, and mild because our cattle eat only organic pasture forage with zero feedlot grain or chemical concentrates. Flash frozen at peak freshness.',
      main_image: SUPABASE_CDN_IMAGES.liver,
      additional_images: JSON.stringify([]),
      status: 'published',
      is_featured: 1,
      cut_options: JSON.stringify(['1 lb Pack (Sliced)', '2 lb Whole Pack']),
      specifications: JSON.stringify({ 'Nutrients': 'Rich in Vitamin A, B12, Iron, CoQ10', 'Diet': '100% Pasture Forage' }),
      seo_title: '100% Grass-Fed Beef Liver | BestGrassFedCattle',
      seo_description: 'Pure nutrient-dense grass-fed beef liver from our Kansas pastures.'
    },
    {
      name: 'Artisanal Beef Tongue Delicacy',
      slug: 'artisanal-beef-tongue-delicacy',
      sku: 'BGC-TNG-005',
      categorySlug: 'tongue',
      price: 18.00,
      short_description: 'Prized tender cut with silky texture, ideal for gourmet slow braises and tacos.',
      full_description: 'Highly sought after by culinary masters. When braised gently with bay leaves, onion, and spices, this delicacy cut yields exceptionally tender, flavorful meat perfect for gourmet Lengua dishes.',
      main_image: SUPABASE_CDN_IMAGES.tongue,
      additional_images: JSON.stringify([]),
      status: 'published',
      is_featured: 0,
      cut_options: JSON.stringify(['Whole Tongue (~2.5-3.5 lbs)']),
      specifications: JSON.stringify({ 'Preparation': 'Slow simmer or braise', 'Handling': 'Hand-trimmed and cryovac packed' }),
      seo_title: 'Grass-Fed Beef Tongue | BestGrassFedCattle',
      seo_description: 'Artisanal grass-fed beef tongue for gourmet braising.'
    },
    {
      name: 'Artisan Beef Marrow Bones & Oxtail Pack',
      slug: 'artisan-beef-marrow-bones-oxtail-pack',
      sku: 'BGC-BON-006',
      categorySlug: 'soup-bones-oxtail',
      price: 15.00,
      short_description: 'Pipe marrow bones and collagen-rich oxtail sections for rich, golden bone broths.',
      full_description: 'Dense femur pipe bones packed with golden marrow and gelatinous oxtail sections. Roasting first yields aromatic golden fat and deep umami before simmering into healing broths.',
      main_image: SUPABASE_CDN_IMAGES.bones1,
      additional_images: JSON.stringify([SUPABASE_CDN_IMAGES.bones2]),
      status: 'published',
      is_featured: 1,
      cut_options: JSON.stringify(['3 lb Broth Pack', '5 lb Value Broth Pack']),
      specifications: JSON.stringify({ 'Usage': 'Bone Broth, Soup, Roasting', 'Source': '100% Pasture Cattle' }),
      seo_title: 'Grass-Fed Marrow Bones & Oxtail | BestGrassFedCattle',
      seo_description: 'Dense nutrient-rich marrow bones and oxtail for collagen broths.'
    },
    {
      name: 'Center-Cut Beef Shank (Osso Buco)',
      slug: 'center-cut-beef-shank-osso-buco',
      sku: 'BGC-SHK-007',
      categorySlug: 'shank-osso-buco',
      price: 21.00,
      short_description: 'Cross-cut beef shanks with centerpiece marrow bone for authentic Osso Buco.',
      full_description: 'Cross-cut across the bone, exposing the rich center marrow surrounded by lean muscle. Braising slowly in wine and pasture broth creates a decadent sauce and fall-apart tender beef.',
      main_image: SUPABASE_CDN_IMAGES.bones2,
      additional_images: JSON.stringify([SUPABASE_CDN_IMAGES.bones1]),
      status: 'published',
      is_featured: 0,
      cut_options: JSON.stringify(['2-Pack (approx 2 lbs)', '4-Pack Family Cut']),
      specifications: JSON.stringify({ 'Cut': 'Cross-cut center shank', 'Cuisine': 'Osso Buco, Stews, Braises' }),
      seo_title: 'Grass-Fed Beef Shank Osso Buco | BestGrassFedCattle',
      seo_description: 'Center-cut grass-fed beef shank with marrow bone for Osso Buco.'
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
      answer: 'Our cattle spend their entire lives grazing open Kansas pastures on a natural rotational diet of clover, orchard grass, and timothy. Unlike industrial beef, our cattle never step foot in a feedlot and are never fed grains, corn silage, antibiotics, or synthetic growth hormones.',
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

  // 5. Seed Gallery using ONLY authentic Supabase photos
  const galleryData = [
    { title: 'Prime Bone-In T-Bone & Porterhouse Steaks', category: 'beef', url: SUPABASE_CDN_IMAGES.tbone, is_featured: 1, sort: 1 },
    { title: 'Artisanal New York Strip Steaks with Marbled Cap', category: 'beef', url: SUPABASE_CDN_IMAGES.strip, is_featured: 1, sort: 2 },
    { title: 'Heritage Marbled Chuck Pot Roast Cuts', category: 'beef', url: SUPABASE_CDN_IMAGES.roast, is_featured: 1, sort: 3 },
    { title: 'Collagen-Rich Center Marrow Bones & Oxtail', category: 'beef', url: SUPABASE_CDN_IMAGES.bones1, is_featured: 1, sort: 4 },
    { title: 'Fresh 100% Pasture-Raised Beef Liver', category: 'beef', url: SUPABASE_CDN_IMAGES.liver, is_featured: 0, sort: 5 },
    { title: 'Artisanal Fresh Grass-Fed Beef Tongue', category: 'beef', url: SUPABASE_CDN_IMAGES.tongue, is_featured: 0, sort: 6 },
    { title: 'Cross-Cut Center Beef Shank (Osso Buco)', category: 'beef', url: SUPABASE_CDN_IMAGES.bones2, is_featured: 0, sort: 7 }
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

  // 6. Seed Site Settings
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
        'Kansas, United States',
        'USD ($)',
        'grassfed@gmail.com',
        '+1 (305) 213-2655',
        '2210 SE 21st St, Topeka, KS 66607',
        '{"instagram":"https://instagram.com/bestgrassfedcattle","facebook":"https://facebook.com/bestgrassfedcattle"}',
        'Ethically raised 100% grass-fed and grass-finished cattle from pristine Kansas pastures. Direct order requests and wholesale arrangements.',
        'system'
      )
    `);
  }

  // 7. Seed Notification Settings
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

  // 8. Seed Sample CMS Content for Live Editing
  const cmsSections = [
    {
      id: 'home_hero',
      page_key: 'home',
      section_key: 'hero',
      content_json: JSON.stringify({
        headline: 'Premium Grass-Fed Beef, Raised With Purpose.',
        subheadline: 'Quality beef from carefully raised cattle in Kansas, presented with the care and standards customers expect from a premium American beef brand.',
        ctaPrimaryText: 'Explore Our Beef',
        ctaSecondaryText: 'Order Beef',
        heroImage: SUPABASE_CDN_IMAGES.tbone
      })
    },
    {
      id: 'home_trust',
      page_key: 'home',
      section_key: 'trust',
      content_json: JSON.stringify({
        badge1_title: '100% Grass-Fed Focus',
        badge1_desc: 'Rotational grazing on pristine Kansas clover and rye pastures.',
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

  console.log('✅ Seeding complete with ZERO demo images.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
