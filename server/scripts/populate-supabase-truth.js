import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing Supabase URL or Service Role Key in server/.env');
  process.exit(1);
}

const client = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// The 7 authentic Supabase photos uploaded by user
const SUPABASE_MEDIA_URLS = {
  tbone: 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/1791760498806_743.jpeg',
  strip: 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/1791760712306_824.jpeg',
  roast: 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/1791760535942_487.jpeg',
  liver: 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/1791760448940_685.jpeg',
  tongue: 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/1791760412733_820.jpeg',
  bones1: 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/1791760328383_39.jpeg',
  bones2: 'https://vorsgkntunffzgulwumc.supabase.co/storage/v1/object/public/media/1791760576218_675.jpeg'
};

async function populateTruth() {
  console.log('='.repeat(70));
  console.log('🌟 POPULATING SUPABASE CLOUD DATABASE WITH AUTHENTIC SOURCE OF TRUTH');
  console.log('='.repeat(70));

  // 1. Admin
  const { data: existingAdmins } = await client.from('admins').select('id').limit(1);
  if (!existingAdmins || existingAdmins.length === 0) {
    const passwordHash = await bcrypt.hash('Password123!', 12);
    const { error: adminErr } = await client.from('admins').insert([{
      id: uuidv4(),
      username: 'admin',
      email: 'admin@bestgrassfedcattle.com',
      password_hash: passwordHash,
      role: 'superadmin'
    }]);
    if (adminErr) console.error('Admin insert error:', adminErr.message);
    else console.log('✅ Admin initialized in Supabase');
  } else {
    console.log('ℹ️ Admin already exists in Supabase');
  }

  // 2. Categories
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
    const { data: existing } = await client.from('categories').select('id').eq('slug', cat.slug).limit(1);
    if (!existing || existing.length === 0) {
      const id = uuidv4();
      await client.from('categories').insert([{
        id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        sort_order: cat.sort_order,
        is_active: 1
      }]);
      categoryMap[cat.slug] = id;
    } else {
      categoryMap[cat.slug] = existing[0].id;
    }
  }
  console.log('✅ Categories synchronized in Supabase');

  // 3. Media Library - Register the 7 authentic Supabase photos
  const mediaLibraryData = [
    {
      id: 'med_tbone_001',
      file_name: '1791760498806_743.jpeg',
      file_url: SUPABASE_MEDIA_URLS.tbone,
      file_type: 'image/jpeg',
      file_size: 147045,
      tags: 'steaks, t-bone, porterhouse, prime'
    },
    {
      id: 'med_strip_002',
      file_name: '1791760712306_824.jpeg',
      file_url: SUPABASE_MEDIA_URLS.strip,
      file_type: 'image/jpeg',
      file_size: 159246,
      tags: 'steaks, new york strip, sirloin, dry-aged'
    },
    {
      id: 'med_roast_003',
      file_name: '1791760535942_487.jpeg',
      file_url: SUPABASE_MEDIA_URLS.roast,
      file_type: 'image/jpeg',
      file_size: 182683,
      tags: 'roast, chuck, braising, pot roast'
    },
    {
      id: 'med_liver_004',
      file_name: '1791760448940_685.jpeg',
      file_url: SUPABASE_MEDIA_URLS.liver,
      file_type: 'image/jpeg',
      file_size: 114351,
      tags: 'liver, organ meats, nutrient-dense'
    },
    {
      id: 'med_tongue_005',
      file_name: '1791760412733_820.jpeg',
      file_url: SUPABASE_MEDIA_URLS.tongue,
      file_type: 'image/jpeg',
      file_size: 136877,
      tags: 'tongue, specialty, artisanal'
    },
    {
      id: 'med_bones_006',
      file_name: '1791760328383_39.jpeg',
      file_url: SUPABASE_MEDIA_URLS.bones1,
      file_type: 'image/jpeg',
      file_size: 146039,
      tags: 'soup bones, marrow, oxtail, collagen'
    },
    {
      id: 'med_shank_007',
      file_name: '1791760576218_675.jpeg',
      file_url: SUPABASE_MEDIA_URLS.bones2,
      file_type: 'image/jpeg',
      file_size: 146039,
      tags: 'shank, marrow bones, osso buco, broth'
    }
  ];

  for (const item of mediaLibraryData) {
    const { error } = await client.from('media_library').upsert([item], { onConflict: 'file_url' });
    if (error) console.error('Media library upsert error:', error.message);
  }
  console.log('✅ 7 Authentic Supabase photos registered in Media Library');

  // 4. Products - ONLY authentic cuts using real Supabase photos!
  const productsData = [
    {
      name: 'Prime T-Bone / Porterhouse Steak',
      slug: 't-bone-porterhouse-steak',
      sku: 'BGC-TBN-001',
      category_id: categoryMap['t-bone-porterhouse'],
      price: 36.50,
      short_description: 'Prime bone-in T-Bone and Porterhouse cuts with tenderloin included. 100% pasture-raised.',
      full_description: 'Our premier bone-in steak featuring both the tender filet mignon and flavorful strip loin separated by the classic T-bone. Raised 100% on open Kansas pastures with zero grain, antibiotics, or hormones. Dry-aged to perfection.',
      main_image: SUPABASE_MEDIA_URLS.tbone,
      additional_images: JSON.stringify([SUPABASE_MEDIA_URLS.strip]),
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
      category_id: categoryMap['new-york-strip-steaks'],
      price: 32.00,
      short_description: 'Tender, robustly marbled New York strip steaks with distinct pasture depth.',
      full_description: 'Hand-trimmed from the short loin, our New York Strip embodies authentic grass-fed beef: clean mineral richness, fine marbling, and a delicate fat cap that crisps to golden perfection.',
      main_image: SUPABASE_MEDIA_URLS.strip,
      additional_images: JSON.stringify([SUPABASE_MEDIA_URLS.tbone]),
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
      category_id: categoryMap['chuck-roasts'],
      price: 19.50,
      short_description: 'Generously marbled shoulder roast; renders into fork-tender richness when slow-braised.',
      full_description: 'The foundation of hearty Sunday family dinners. Rich connective tissue and natural pasture marbling gently melt into rich collagen broth during low-and-slow roasting with root herbs and garlic.',
      main_image: SUPABASE_MEDIA_URLS.roast,
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
      category_id: categoryMap['liver'],
      price: 12.00,
      short_description: 'Nutrient-dense, iron-rich fresh beef liver from 100% pasture-grazed cattle.',
      full_description: 'Nature’s most concentrated superfood. Clean, sweet, and mild because our cattle eat only organic pasture forage with zero feedlot grain or chemical concentrates. Flash frozen at peak freshness.',
      main_image: SUPABASE_MEDIA_URLS.liver,
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
      category_id: categoryMap['tongue'],
      price: 18.00,
      short_description: 'Prized tender cut with silky texture, ideal for gourmet slow braises and tacos.',
      full_description: 'Highly sought after by culinary masters. When braised gently with bay leaves, onion, and spices, this delicacy cut yields exceptionally tender, flavorful meat perfect for gourmet Lengua dishes.',
      main_image: SUPABASE_MEDIA_URLS.tongue,
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
      category_id: categoryMap['soup-bones-oxtail'],
      price: 15.00,
      short_description: 'Pipe marrow bones and collagen-rich oxtail sections for rich, golden bone broths.',
      full_description: 'Dense femur pipe bones packed with golden marrow and gelatinous oxtail sections. Roasting first yields aromatic golden fat and deep umami before simmering into healing broths.',
      main_image: SUPABASE_MEDIA_URLS.bones1,
      additional_images: JSON.stringify([SUPABASE_MEDIA_URLS.bones2]),
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
      category_id: categoryMap['shank-osso-buco'],
      price: 21.00,
      short_description: 'Cross-cut beef shanks with centerpiece marrow bone for authentic Osso Buco.',
      full_description: 'Cross-cut across the bone, exposing the rich center marrow surrounded by lean muscle. Braising slowly in wine and pasture broth creates a decadent sauce and fall-apart tender beef.',
      main_image: SUPABASE_MEDIA_URLS.bones2,
      additional_images: JSON.stringify([SUPABASE_MEDIA_URLS.bones1]),
      status: 'published',
      is_featured: 0,
      cut_options: JSON.stringify(['2-Pack (approx 2 lbs)', '4-Pack Family Cut']),
      specifications: JSON.stringify({ 'Cut': 'Cross-cut center shank', 'Cuisine': 'Osso Buco, Stews, Braises' }),
      seo_title: 'Grass-Fed Beef Shank Osso Buco | BestGrassFedCattle',
      seo_description: 'Center-cut grass-fed beef shank with marrow bone for Osso Buco.'
    }
  ];

  // Clean old products first to ensure zero stale/demo entries exist
  const { error: delProdErr } = await client.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delProdErr) console.warn('Product clean warning:', delProdErr.message);

  for (const prod of productsData) {
    const { error: prodErr } = await client.from('products').insert([{
      id: uuidv4(),
      ...prod
    }]);
    if (prodErr) console.error(`Error inserting product ${prod.name}:`, prodErr.message);
  }
  console.log(`✅ ${productsData.length} Authentic Products inserted into Supabase (ZERO demo images)`);

  // 5. Gallery Images - Using ONLY authentic Supabase photos
  const galleryData = [
    { title: 'Prime Bone-In T-Bone & Porterhouse Steaks', category: 'beef', image_url: SUPABASE_MEDIA_URLS.tbone, is_featured: 1, sort_order: 1 },
    { title: 'Artisanal New York Strip Steaks with Marbled Cap', category: 'beef', image_url: SUPABASE_MEDIA_URLS.strip, is_featured: 1, sort_order: 2 },
    { title: 'Heritage Marbled Chuck Pot Roast Cuts', category: 'beef', image_url: SUPABASE_MEDIA_URLS.roast, is_featured: 1, sort_order: 3 },
    { title: 'Collagen-Rich Center Marrow Bones & Oxtail', category: 'beef', image_url: SUPABASE_MEDIA_URLS.bones1, is_featured: 1, sort_order: 4 },
    { title: 'Fresh 100% Pasture-Raised Beef Liver', category: 'beef', image_url: SUPABASE_MEDIA_URLS.liver, is_featured: 0, sort_order: 5 },
    { title: 'Artisanal Fresh Grass-Fed Beef Tongue', category: 'beef', image_url: SUPABASE_MEDIA_URLS.tongue, is_featured: 0, sort_order: 6 },
    { title: 'Cross-Cut Center Beef Shank (Osso Buco)', category: 'beef', image_url: SUPABASE_MEDIA_URLS.bones2, is_featured: 0, sort_order: 7 }
  ];

  await client.from('gallery_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  for (const g of galleryData) {
    const { error: galErr } = await client.from('gallery_images').insert([{
      id: uuidv4(),
      ...g
    }]);
    if (galErr) console.error(`Error inserting gallery image ${g.title}:`, galErr.message);
  }
  console.log(`✅ ${galleryData.length} Authentic Gallery Images inserted into Supabase`);

  // 6. Site Settings
  await client.from('site_settings').upsert([{
    id: 'default',
    business_name: 'BestGrassFedCattle',
    tagline: 'Premium Grass-Fed Beef, Raised With Purpose.',
    location: 'Kansas, United States',
    currency: 'USD ($)',
    contact_email: 'grassfed@gmail.com',
    contact_phone: '+1 (305) 213-2655',
    address: '2210 SE 21st St, Topeka, KS 66607',
    social_links: JSON.stringify({ instagram: 'https://instagram.com/bestgrassfedcattle', facebook: 'https://facebook.com/bestgrassfedcattle' }),
    brand_description: 'Ethically raised 100% grass-fed and grass-finished cattle from pristine Kansas pastures.',
    theme_default: 'system'
  }], { onConflict: 'id' });
  console.log('✅ Site settings configured in Supabase');

  // 7. Notification Settings
  await client.from('notification_settings').upsert([{
    id: 'default',
    admin_dashboard_enabled: 1,
    email_enabled: 0,
    email_recipient: 'grassfed@gmail.com',
    telegram_enabled: 0,
    whatsapp_enabled: 0,
    livechat_enabled: 0
  }], { onConflict: 'id' });
  console.log('✅ Notification settings configured in Supabase');

  // 8. CMS Content - Hero Image using authentic photo
  await client.from('cms_content').upsert([
    {
      id: 'home_hero',
      page_key: 'home',
      section_key: 'hero',
      content_json: JSON.stringify({
        headline: 'Premium Grass-Fed Beef, Raised With Purpose.',
        subheadline: 'Quality beef from carefully raised cattle in Kansas, presented with the care and standards customers expect from a premium American beef brand.',
        ctaPrimaryText: 'Explore Our Beef',
        ctaSecondaryText: 'Order Beef',
        heroImage: SUPABASE_MEDIA_URLS.tbone
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
  ], { onConflict: 'id' });
  console.log('✅ CMS content configured in Supabase');

  console.log('\n' + '='.repeat(70));
  console.log('🎉 SUPABASE CLOUD DATABASE FULLY POPULATED AS SOURCE OF TRUTH!');
  console.log('='.repeat(70));
}

populateTruth().catch(err => {
  console.error('Fatal population error:', err);
  process.exit(1);
});
