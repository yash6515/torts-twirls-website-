const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Product = require('../models/Product');

const products = [
  {
    name: 'Ivory Whisper Cotton Set',
    description: 'Experience cloud-like softness with our 400-thread-count Egyptian cotton bedsheet set. Expertly woven for breathability and durability, this timeless ivory set brings quiet elegance to any bedroom. The sateen weave creates a subtle sheen that catches light beautifully. Includes flat sheet, fitted sheet, and two pillowcases.',
    shortDescription: '400 TC Egyptian cotton | Sateen weave | Naturally breathable',
    price: 3499,
    discountPrice: 2799,
    images: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800',
      'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800'
    ],
    category: 'cotton',
    size: ['single', 'double', 'queen', 'king'],
    color: ['Ivory', 'White'],
    fabric: 'Egyptian Cotton',
    threadCount: 400,
    features: ['400 Thread Count', 'Sateen Weave', 'Naturally breathable', 'Machine washable', 'Fade resistant'],
    stock: 50,
    sku: 'TT-COT-001',
    tags: ['cotton', 'luxury', 'ivory', 'sateen'],
    isFeatured: true,
    rating: 4.8,
    numReviews: 124
  },
  {
    name: 'Blush Garden Printed Set',
    description: 'Bring the beauty of a garden indoors with our delicate floral printed bedsheet set. Crafted from premium 300-thread-count cotton percale, this blush-toned set features hand-drawn botanical motifs that never fade. The crisp percale weave keeps you cool in summer and cozy in winter.',
    shortDescription: '300 TC cotton percale | Botanical prints | Colorfast dye',
    price: 2899,
    discountPrice: 2299,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800'
    ],
    category: 'printed',
    size: ['double', 'queen', 'king'],
    color: ['Blush Pink', 'Rose'],
    fabric: 'Cotton Percale',
    threadCount: 300,
    features: ['300 Thread Count', 'Percale weave', 'Colorfast printing', 'Soft pre-washed finish', 'Easy care'],
    stock: 35,
    sku: 'TT-PRT-001',
    tags: ['printed', 'floral', 'blush', 'garden'],
    isFeatured: true,
    rating: 4.6,
    numReviews: 89
  },
  {
    name: 'Midnight Luxe Silk Set',
    description: 'Indulge in pure luxury with our mulberry silk bedsheet set. This 22-momme silk set drapes like a dream and regulates body temperature naturally. The deep midnight blue hue adds dramatic sophistication to your bedroom sanctuary. Gentle on skin and hair, perfect for sensitive skin types.',
    shortDescription: '22 Momme Mulberry Silk | Temperature regulating | Hypoallergenic',
    price: 8999,
    discountPrice: 7499,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
      'https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800',
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800'
    ],
    category: 'silk',
    size: ['queen', 'king', 'super-king'],
    color: ['Midnight Blue', 'Navy'],
    fabric: 'Mulberry Silk',
    threadCount: 0,
    features: ['22 Momme weight', 'Grade 6A silk', 'Temperature regulating', 'Hypoallergenic', 'Anti-aging properties'],
    stock: 20,
    sku: 'TT-SLK-001',
    tags: ['silk', 'luxury', 'midnight', 'premium'],
    isFeatured: true,
    rating: 4.9,
    numReviews: 56
  },
  {
    name: 'Sage Linen Breeze Set',
    description: 'Our pre-washed linen bedsheet set offers an effortlessly relaxed aesthetic with superior comfort. The sage green hue evokes calm and tranquility, while the natural linen fibers become softer with every wash. Perfect for warm climates, this set is ultra-breathable and moisture-wicking.',
    shortDescription: 'Pre-washed European linen | Gets softer with each wash | Eco-friendly',
    price: 4599,
    discountPrice: 3799,
    images: [
      'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800',
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800',
      'https://images.unsplash.com/photo-1601824287678-c5e9d3993cfa?w=800'
    ],
    category: 'linen',
    size: ['single', 'double', 'queen', 'king'],
    color: ['Sage Green', 'Olive'],
    fabric: 'European Linen',
    threadCount: 0,
    features: ['Pre-washed finish', 'OEKO-TEX certified', 'Gets softer over time', 'Moisture wicking', 'Temperature regulating'],
    stock: 40,
    sku: 'TT-LIN-001',
    tags: ['linen', 'sage', 'eco', 'breathable'],
    isFeatured: true,
    rating: 4.7,
    numReviews: 73
  },
  {
    name: 'Cloud Microfiber King Set',
    description: 'Ultra-soft and budget-friendly, our microfiber king bedsheet set offers hotel-quality comfort at home. The brushed microfiber fabric is incredibly soft to the touch and highly resistant to wrinkles and shrinkage. With deep pocket fitted sheets (fits up to 15" mattresses), you get a smooth, tight fit every time.',
    shortDescription: '1800 Series microfiber | Wrinkle resistant | Deep pockets 15"',
    price: 1899,
    discountPrice: 1499,
    images: [
      'https://images.unsplash.com/photo-1631048835658-55e2aec6b745?w=800',
      'https://images.unsplash.com/photo-1596702874230-8bd19d0ebb60?w=800',
      'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800'
    ],
    category: 'microfiber',
    size: ['king', 'super-king'],
    color: ['White', 'Pearl'],
    fabric: 'Microfiber',
    threadCount: 1800,
    features: ['1800 thread count equiv', 'Wrinkle resistant', 'Stain resistant', 'Deep 15" pockets', 'Machine washable'],
    stock: 80,
    sku: 'TT-MIC-001',
    tags: ['microfiber', 'king', 'value', 'soft'],
    isFeatured: false,
    rating: 4.4,
    numReviews: 201
  },
  {
    name: 'Terracotta Boho Printed Set',
    description: 'Channel bohemian sophistication with our block-printed terracotta bedsheet set. Inspired by traditional Indian craftsmanship, each sheet features hand-block prints with geometric patterns. Made from 100% organic cotton, this set is as good for the planet as it is beautiful in your bedroom.',
    shortDescription: '100% organic cotton | Hand block printed | GOTS certified',
    price: 3199,
    discountPrice: 0,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800'
    ],
    category: 'printed',
    size: ['single', 'double', 'queen'],
    color: ['Terracotta', 'Rust', 'Brown'],
    fabric: 'Organic Cotton',
    threadCount: 250,
    features: ['GOTS Certified Organic', 'Hand block printed', 'Azo-free dyes', 'Artisan crafted', 'Fair trade'],
    stock: 30,
    sku: 'TT-PRT-002',
    tags: ['boho', 'terracotta', 'organic', 'handmade'],
    isFeatured: false,
    rating: 4.5,
    numReviews: 48
  },
  {
    name: 'Pearl Embroidered Luxury Set',
    description: 'Elevate your bedroom to five-star status with our hand-embroidered pearl white bedsheet set. Crafted from 500-thread-count Egyptian cotton, the intricate floral embroidery along the border is done by skilled artisans. This heirloom-quality set gets more beautiful with every wash.',
    shortDescription: '500 TC Egyptian Cotton | Hand embroidered border | Heirloom quality',
    price: 5999,
    discountPrice: 4999,
    images: [
      'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=800',
      'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800',
      'https://images.unsplash.com/photo-1617325247661-675ab4b64ae2?w=800'
    ],
    category: 'embroidered',
    size: ['queen', 'king'],
    color: ['Pearl White', 'Cream'],
    fabric: 'Egyptian Cotton',
    threadCount: 500,
    features: ['500 Thread Count', 'Hand embroidered', 'Heirloom quality', 'Gift packaged', 'Luxury sateen weave'],
    stock: 15,
    sku: 'TT-EMB-001',
    tags: ['embroidered', 'luxury', 'pearl', 'gift'],
    isFeatured: true,
    rating: 4.9,
    numReviews: 34
  },
  {
    name: 'Dusty Blue Plain Percale Set',
    description: 'Our bestselling plain percale set in a calming dusty blue. The crisp, cool feel of percale cotton is perfect for hot sleepers and those who love a classic hotel-bed experience. The solid color works beautifully with any bedroom decor, making it incredibly versatile.',
    shortDescription: '300 TC percale | Crisp hotel feel | Perfect for hot sleepers',
    price: 2599,
    discountPrice: 2099,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      'https://images.unsplash.com/photo-1631048835658-55e2aec6b745?w=800',
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'
    ],
    category: 'plain',
    size: ['single', 'double', 'queen', 'king', 'super-king'],
    color: ['Dusty Blue', 'Steel Blue'],
    fabric: 'Cotton Percale',
    threadCount: 300,
    features: ['300 Thread Count', 'Percale weave', 'Cool & crisp feel', 'Long staple cotton', 'Oeko-Tex certified'],
    stock: 60,
    sku: 'TT-PLN-001',
    tags: ['plain', 'blue', 'percale', 'cool'],
    isFeatured: false,
    rating: 4.6,
    numReviews: 156
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/torts-and-twirls');
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    await User.deleteMany({});

    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ ${insertedProducts.length} products seeded`);

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@tortsandtwirls.com',
      password: 'admin123456',
      role: 'admin',
      phone: '9999999999'
    });
    console.log('✅ Admin user created: admin@tortsandtwirls.com / admin123456');

    // Create test user
    const testUser = await User.create({
      name: 'Test User',
      email: 'user@tortsandtwirls.com',
      password: 'user123456',
      role: 'user',
      phone: '8888888888'
    });
    console.log('✅ Test user created: user@tortsandtwirls.com / user123456');

    mongoose.disconnect();
    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedDB();
