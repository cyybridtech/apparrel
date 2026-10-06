export interface InitialUser {
  id: number;
  username?: string;
  name: string;
  email: string;
  phone: string;
  password: string; // Plaintext for demo seed / hashed on login
  role: "admin" | "seller" | "customer";
  sellerId?: number;
  mustSetPassword?: boolean;
  address: string;
  city: string;
  region: string;
}

export interface InitialSeller {
  id: number;
  memberNumber: number;
  username?: string;
  name: string;
  email: string;
  phone: string;
  storeName: string;
  storeSlug: string;
  categorySpecialty: string;
  memberRole: string;
  paystackSubaccount: string;
  commissionRate: number; // 0.05 = 5% platform share
  payoutBank: string;
  payoutAccount: string;
  balanceCents: number;
  totalPaidCents: number;
  status: "active" | "suspended" | "pending";
  avatar: string;
  bio: string;
}

export interface InitialProduct {
  sellerId: number;
  slug: string;
  name: string;
  brand: string;
  category: "tops" | "sneakers" | "perfumes" | "watches" | "tech" | "bags" | "body-sprays";
  subCategory: string;
  description: string;
  features: string[];
  priceCents: number; // e.g. 45000 = GHS 450.00
  compareAtCents?: number;
  images: string[];
  colorway: string;
  rating: number;
  ratingCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  badge?: string;
  gender?: string;
  sku: string;
  approvalStatus?: "approved" | "pending_review" | "draft" | "rejected";
  sizes: { label: string; stock: number }[];
}

export const INITIAL_USERS: InitialUser[] = [
  {
    id: 1,
    username: "admin",
    name: "Cyybrid Platform Super Admin",
    email: "admin@cyybrid.tech",
    phone: "+233 24 555 0100",
    password: "admin",
    role: "admin",
    address: "14 Independence Avenue, Airport Residential",
    city: "Accra",
    region: "Greater Accra",
  },
];

export const INITIAL_SELLERS: InitialSeller[] = [];

export const INITIAL_CATEGORIES = [
  {
    slug: "all",
    name: "All Collections",
    description: "Browse authenticated products across Footwear, Horology, Streetwear, Audio Tech, and Luxury Leather.",
    icon: "Sparkles",
    itemCount: 16,
    featured: true,
  },
  {
    slug: "sneakers",
    name: "Footwear & Sneakers",
    description: "Retro basketball silhouettes, marathon carbon runners, and luxury leather trainers.",
    icon: "Footprints",
    itemCount: 4,
    featured: true,
    bannerImage: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1200&auto=format&fit=crop",
  },
  {
    slug: "watches",
    name: "Watches & Horology",
    description: "Precision automatic chronographs, sapphire crystal steel, and dual-time GMT divers.",
    icon: "Watch",
    itemCount: 3,
    featured: true,
    bannerImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
  },
  {
    slug: "tops",
    name: "Streetwear & Apparel",
    description: "Heavyweight boxy organic tees, loopback French terry hoodies, and resort linen shirts.",
    icon: "Shirt",
    itemCount: 3,
    featured: true,
    bannerImage: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop",
  },
  {
    slug: "tech",
    name: "Electronics & Audio",
    description: "Titanium active noise-cancelling headphones, true wireless earbuds, and 3-in-1 MagCharge docks.",
    icon: "Zap",
    itemCount: 3,
    featured: true,
    bannerImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
  },
  {
    slug: "bags",
    name: "Leather & Travel Bags",
    description: "Full-grain weekender duffles, RFID calfskin wallets, and artisanal extraits de parfum.",
    icon: "Package",
    itemCount: 3,
    featured: true,
    bannerImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1200&auto=format&fit=crop",
  },
];

export const INITIAL_PRODUCTS: InitialProduct[] = [
  // ─── FOOTWEAR ───────────────────────────────────────────────
  {
    sellerId: 1,
    slug: "court-heritage-85-retro-high",
    name: "Court Heritage 85 Retro High-Top",
    brand: "KICKS & SOLES",
    category: "sneakers",
    subCategory: "High-Tops",
    description: "Iconic 1985 basketball court DNA rebuilt with buttery full-grain Italian leather, air-cushioned encapsulated sole, and vintage parchment midsole tint.",
    features: [
      "100% Full-Grain Tumbled Italian Leather Upper",
      "Encapsulated Air-Sole unit in heel for lightweight cushioning",
      "Perforated toe box for maximum ventilation",
      "Vintage pre-aged cupsole with multi-directional herringbone grip",
    ],
    priceCents: 145000, // GHS 1,450.00
    compareAtCents: 185000,
    images: [
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?q=80&w=1000&auto=format&fit=crop",
    ],
    colorway: "Varsity Royal / Summit White",
    rating: 4.96,
    ratingCount: 52,
    isNew: true,
    isFeatured: true,
    isTrending: true,
    badge: "BESTSELLER",
    gender: "Unisex",
    sku: "SNK-CRT-85",
    approvalStatus: "approved",
    sizes: [
      { label: "US 8", stock: 12 },
      { label: "US 8.5", stock: 18 },
      { label: "US 9", stock: 25 },
      { label: "US 9.5", stock: 20 },
      { label: "US 10", stock: 15 },
      { label: "US 11", stock: 8 },
    ],
  },
  {
    sellerId: 1,
    slug: "marathon-elite-carbon-runner",
    name: "Marathon Elite Carbon Flyknit Runner",
    brand: "KICKS & SOLES",
    category: "sneakers",
    subCategory: "Runners",
    description: "Engineered with a full-length curved carbon fiber propulsion plate and dual-density supercritical foam for maximum energy return on race day.",
    features: [
      "Full-Length Rigid Carbon Fiber Propulsion Plate",
      "Supercritical Nitrogen-Infused Responsive Midsole Foam",
      "Seamless engineered mono-mesh ultra-breathable upper",
      "Ultra-thin rubber outsole engineered for wet tarmac grip",
    ],
    priceCents: 189000,
    compareAtCents: 230000,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=1000&auto=format&fit=crop",
    ],
    colorway: "Hyper Crimson / Volt Glow",
    rating: 4.98,
    ratingCount: 44,
    isNew: true,
    isFeatured: true,
    isTrending: true,
    badge: "PRO RUNNER",
    gender: "Unisex",
    sku: "SNK-MRTH-CRB",
    approvalStatus: "approved",
    sizes: [
      { label: "US 8", stock: 6 },
      { label: "US 9", stock: 14 },
      { label: "US 9.5", stock: 16 },
      { label: "US 10", stock: 10 },
      { label: "US 11", stock: 4 },
    ],
  },
  {
    sellerId: 1,
    slug: "monochrome-minimalist-luxe-low",
    name: "Monochrome Minimalist Calfskin Low",
    brand: "KICKS & SOLES",
    category: "sneakers",
    subCategory: "Lifestyle",
    description: "Clean, understated luxury low-top hand-stitched with ultra-soft white nappa calfskin, waxed cotton laces, and Margom rubber cupsole.",
    features: [
      "Ultra-Supple Full Grain White Nappa Calfskin",
      "Custom Italian Margom Rubber Outsole with stitched welt",
      "Calf leather lining and memory-foam arch support insole",
      "Subtle gold foil serial number stamped at heel",
    ],
    priceCents: 125000,
    compareAtCents: 155000,
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=1000&auto=format&fit=crop",
    ],
    colorway: "Pure Triple White",
    rating: 4.88,
    ratingCount: 36,
    isNew: false,
    isFeatured: false,
    isTrending: true,
    badge: "DAILY LUXURY",
    gender: "Unisex",
    sku: "SNK-MN-CALF",
    approvalStatus: "approved",
    sizes: [
      { label: "US 7.5", stock: 8 },
      { label: "US 8.5", stock: 12 },
      { label: "US 9.5", stock: 15 },
      { label: "US 10.5", stock: 9 },
    ],
  },
  {
    sellerId: 1,
    slug: "all-terrain-trail-tactical-boot",
    name: "All-Terrain Vibram Trail Sneaker",
    brand: "KICKS & SOLES",
    category: "sneakers",
    subCategory: "Trail",
    description: "Built for urban exploration and rugged trails. Features Cordura ballistic ripstop upper, Vibram Megagrip lugged outsole, and speed-lacing system.",
    features: [
      "Water-repellent Cordura Ballistic Ripstop upper",
      "Vibram Megagrip high-traction 5mm multidirectional lugs",
      "Quick-cinch bungee cord lace lock mechanism",
      "Molded TPU heel stabilizer and toe rock protection guard",
    ],
    priceCents: 162000,
    compareAtCents: 195000,
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?q=80&w=1000&auto=format&fit=crop",
    ],
    colorway: "Desert Sand / Carbon Grey",
    rating: 4.9,
    ratingCount: 28,
    isNew: false,
    isFeatured: true,
    isTrending: false,
    badge: "VIBRAM SOLE",
    gender: "Men",
    sku: "SNK-TRL-VIB",
    approvalStatus: "approved",
    sizes: [
      { label: "US 8", stock: 8 },
      { label: "US 9", stock: 10 },
      { label: "US 10", stock: 12 },
      { label: "US 11", stock: 6 },
    ],
  },

  // ─── WATCHES & HOROLOGY ─────────────────────────────────────
  {
    sellerId: 2,
    slug: "chronos-stealth-pvd-chronograph",
    name: "Chronos Stealth PVD Automatic Chronograph",
    brand: "CHRONO & HERITAGE",
    category: "watches",
    subCategory: "Chronographs",
    description: "Matte black DLC-coated 316L surgical stainless steel case housing a high-beat automatic chronograph movement with sapphire crystal and exhibition caseback.",
    features: [
      "High-Beat 28,800 vph Swiss-Engineered Automatic Movement",
      "Anti-reflective scratch-proof sapphire crystal glass",
      "Matte black DLC (Diamond-Like Carbon) hardened coating",
      "100M / 10 ATM Water Resistance with screw-down crown",
      "Luminescent Super-LumiNova dial markers and hands",
    ],
    priceCents: 285000, // GHS 2,850.00
    compareAtCents: 350000,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000&auto=format&fit=crop",
    ],
    colorway: "Stealth DLC Matte Black",
    rating: 4.99,
    ratingCount: 31,
    isNew: true,
    isFeatured: true,
    isTrending: true,
    badge: "MASTER HOROLOGY",
    gender: "Unisex",
    sku: "WTC-CHRN-PVD",
    approvalStatus: "approved",
    sizes: [
      { label: "42mm Case", stock: 8 },
      { label: "40mm Case", stock: 6 },
    ],
  },
  {
    sellerId: 2,
    slug: "bauhaus-minimalist-dress-watch",
    name: "Bauhaus Sub-Second Minimalist Dress Watch",
    brand: "CHRONO & HERITAGE",
    category: "watches",
    subCategory: "Dress Watches",
    description: "Clean architectural German Bauhaus aesthetics with slim 7.8mm profil, genuine Horween leather strap, and sub-second complications.",
    features: [
      "Ultra-thin 7.8mm 316L polished surgical steel case",
      "Genuine Chicago Horween Shell Cordovan leather strap",
      "Enamel finish minimalist dial with tempered blued steel hands",
      "50M water resistance & quick-release spring bars",
    ],
    priceCents: 195000,
    compareAtCents: 240000,
    images: [
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=1000&auto=format&fit=crop",
    ],
    colorway: "Silver / Cognac Leather",
    rating: 4.92,
    ratingCount: 24,
    isNew: false,
    isFeatured: true,
    isTrending: true,
    badge: "LIMITED EDITION",
    gender: "Unisex",
    sku: "WTC-BAU-SLV",
    approvalStatus: "approved",
    sizes: [
      { label: "38mm Case", stock: 10 },
      { label: "40mm Case", stock: 12 },
    ],
  },
  {
    sellerId: 2,
    slug: "horizon-gmt-dual-time-diver",
    name: "Horizon GMT Dual-Time 300M Diver",
    brand: "CHRONO & HERITAGE",
    category: "watches",
    subCategory: "Divers & GMT",
    description: "Professional grade 300-meter diver watch with 24-click ceramic bi-directional bezel, independent GMT hour hand, and solid link jubilee bracelet.",
    features: [
      "300M / 30 ATM Deep Sea Water Resistance",
      "Scratch-proof Ceramic Bi-Color GMT 24-Hour Bezel",
      "Solid milled 316L stainless steel jubilee bracelet with micro-adjust clasp",
      "Helium escape valve for deep saturation diving",
    ],
    priceCents: 320000,
    compareAtCents: 390000,
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1533139502658-0198f920d8e8?q=80&w=1000&auto=format&fit=crop",
    ],
    colorway: "Pepsi Blue & Crimson / Jubilee Steel",
    rating: 4.97,
    ratingCount: 39,
    isNew: true,
    isFeatured: false,
    isTrending: true,
    badge: "TOP SPEC",
    gender: "Men",
    sku: "WTC-GMT-DVR",
    approvalStatus: "approved",
    sizes: [
      { label: "41mm Case", stock: 14 },
    ],
  },

  // ─── STREETWEAR & APPAREL ───────────────────────────────────
  {
    sellerId: 3,
    slug: "heavyweight-oversized-noir-tee",
    name: "Heavyweight Boxy Noir Tee",
    brand: "CYYBRID ATELIER",
    category: "tops",
    subCategory: "Graphic Tees",
    description: "Crafted from custom 290 GSM combed organic cotton with a structured drop-shoulder drape, ribbed collar, and minimal spine puff print.",
    features: [
      "100% Combed Heavyweight Organic Cotton (290 GSM)",
      "Structured boxy silhouette with relaxed drop shoulder",
      "Reinforced twin-needle collar stitching that never sags",
      "Garment dyed & pre-shrunk for an enduring vintage feel",
    ],
    priceCents: 42000, // GHS 420.00
    compareAtCents: 55000,
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop",
    ],
    colorway: "Washed Obsidian",
    rating: 4.9,
    ratingCount: 38,
    isNew: true,
    isFeatured: true,
    isTrending: true,
    badge: "BESTSELLER",
    gender: "Unisex",
    sku: "TOP-NOIR-290",
    approvalStatus: "approved",
    sizes: [
      { label: "S", stock: 15 },
      { label: "M", stock: 24 },
      { label: "L", stock: 18 },
      { label: "XL", stock: 10 },
      { label: "XXL", stock: 6 },
    ],
  },
  {
    sellerId: 3,
    slug: "french-terry-arch-hoodie",
    name: "Architect Heavy French Terry Hoodie",
    brand: "CYYBRID ATELIER",
    category: "tops",
    subCategory: "Hoodies",
    description: "480 GSM dense loopback French terry hoodie engineered with a double-layered structured hood without drawstrings, seamless pockets, and hidden cuff thumbholes.",
    features: [
      "480 GSM High-Density Loopback Cotton Terry",
      "Double-layered structured hood (no drawstrings)",
      "Concealed side-seam pockets with bar-tack reinforcement",
      "Heavyweight ribbed waistband and cuffs",
    ],
    priceCents: 89000,
    compareAtCents: 110000,
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=1000&auto=format&fit=crop",
    ],
    colorway: "Slate Heather Grey",
    rating: 4.95,
    ratingCount: 45,
    isNew: false,
    isFeatured: true,
    isTrending: true,
    badge: "LIMITED DROP",
    gender: "Unisex",
    sku: "TOP-HD-TERRY",
    approvalStatus: "approved",
    sizes: [
      { label: "S", stock: 8 },
      { label: "M", stock: 14 },
      { label: "L", stock: 20 },
      { label: "XL", stock: 12 },
    ],
  },
  {
    sellerId: 3,
    slug: "monochrome-resort-linen-shirt",
    name: "Monochrome Camp Collar Linen Shirt",
    brand: "CYYBRID ATELIER",
    category: "tops",
    subCategory: "Button Downs",
    description: "Effortlessly breezy camp-collar shirt woven from pure French flax linen. Features mother-of-pearl buttons and a clean straight hem designed to be worn untucked.",
    features: [
      "100% Pure French Flax Linen",
      "Relaxed Cuban / Camp open collar",
      "Natural mother-of-pearl engraved buttons",
      "Breathable moisture-wicking weave for tropical climates",
    ],
    priceCents: 68000,
    compareAtCents: 85000,
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=1000&auto=format&fit=crop",
    ],
    colorway: "Chalk Off-White",
    rating: 4.8,
    ratingCount: 22,
    isNew: true,
    isFeatured: false,
    isTrending: true,
    badge: "NEW ARRIVAL",
    gender: "Men",
    sku: "TOP-LINEN-WHT",
    approvalStatus: "approved",
    sizes: [
      { label: "S", stock: 10 },
      { label: "M", stock: 16 },
      { label: "L", stock: 12 },
      { label: "XL", stock: 8 },
    ],
  },

  // ─── ELECTRONICS & AUDIO ────────────────────────────────────
  {
    sellerId: 4,
    slug: "volt-studio-pro-anc-headphones",
    name: "Volt Studio Pro Wireless ANC Headphones",
    brand: "VOLT AUDIO",
    category: "tech",
    subCategory: "Headphones",
    description: "Flagship wireless active noise-cancelling headphones featuring 40mm custom titanium dome drivers, spatial audio head tracking, memory-foam protein leather cups, and 55-hour battery life.",
    features: [
      "Hybrid Triple-Mic Active Noise Cancellation (-42dB suppression)",
      "Custom 40mm Titanium Composite Acoustic Drivers",
      "Hi-Res Wireless Audio LDAC & AAC codec support",
      "55 Hours Continuous Playback / 10-min Fast Charge gives 5 hours",
      "CNC Aircraft-grade Aluminum Adjustment Yokes",
    ],
    priceCents: 125000, // GHS 1,250.00
    compareAtCents: 160000,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=1000&auto=format&fit=crop",
    ],
    colorway: "Graphite Matte Black / Silver",
    rating: 4.97,
    ratingCount: 48,
    isNew: true,
    isFeatured: true,
    isTrending: true,
    badge: "HI-RES AUDIO",
    gender: "Unisex",
    sku: "TCH-VLT-HP1",
    approvalStatus: "approved",
    sizes: [
      { label: "One Size", stock: 22 },
    ],
  },
  {
    sellerId: 4,
    slug: "cyybrid-pulse-tws-earbuds",
    name: "Cyybrid Pulse True Wireless ANC Earbuds",
    brand: "VOLT AUDIO",
    category: "tech",
    subCategory: "Earbuds",
    description: "Compact ergonomic in-ear wireless buds with dynamic environmental noise reduction, low-latency gaming mode, wireless charging case, and IPX7 water resistance.",
    features: [
      "Bluetooth 5.4 with Instant Dual-Connect Pairing",
      "IPX7 Sweat & Rain Resistance for intense workouts",
      "32 Hours Total Playtime with Qi Wireless Charging Case",
      "Quad ENC Beamforming Microphones for crystal clear calls",
    ],
    priceCents: 68000, // GHS 680.00
    compareAtCents: 89000,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?q=80&w=1000&auto=format&fit=crop",
    ],
    colorway: "Frost White",
    rating: 4.89,
    ratingCount: 35,
    isNew: true,
    isFeatured: false,
    isTrending: true,
    badge: "WIRELESS QI",
    gender: "Unisex",
    sku: "TCH-PLS-TWS",
    approvalStatus: "approved",
    sizes: [
      { label: "Standard (S/M/L Tips)", stock: 35 },
    ],
  },
  {
    sellerId: 4,
    slug: "magcharge-3in1-aluminum-dock",
    name: "MagCharge 3-in-1 Solid Aluminum Wireless Station",
    brand: "VOLT AUDIO",
    category: "tech",
    subCategory: "Charging Docks",
    description: "Architectural monolithic charging dock precision CNC milled from solid aluminum alloy. Simultaneously fast-charges Phone (15W MagSafe), Smart Watch, and Wireless Earbuds.",
    features: [
      "15W High-Speed MagSafe Compatible Magnetic Alignment",
      "Solid Anodized Space Grey Billet Aluminum Construction",
      "Built-in smart thermal heat dissipation channels",
      "Single USB-C braided cable powers all 3 charging coils",
    ],
    priceCents: 45000,
    compareAtCents: 58000,
    images: [
      "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1622445262464-84b1456045b6?q=80&w=1000&auto=format&fit=crop",
    ],
    colorway: "Space Grey Anodized",
    rating: 4.93,
    ratingCount: 29,
    isNew: false,
    isFeatured: true,
    isTrending: false,
    badge: "FAST 15W",
    gender: "Unisex",
    sku: "TCH-MAG-DK3",
    approvalStatus: "approved",
    sizes: [
      { label: "Universal Dock", stock: 18 },
    ],
  },

  // ─── LEATHER & BAGS ─────────────────────────────────────────
  {
    sellerId: 5,
    slug: "sovereign-full-grain-leather-duffle",
    name: "Sovereign Full-Grain Leather Weekender Duffle",
    brand: "ARTISAN LEATHER CO.",
    category: "bags",
    subCategory: "Travel Bags",
    description: "Heirloom-grade weekender bag handcrafted from vegetable-tanned 2.2mm full-grain pull-up leather, solid antique brass hardware, Japanese YKK Excella zippers, and dedicated ventilated shoe compartment.",
    features: [
      "100% Vegetable-Tanned Italian Full-Grain Cowhide",
      "Solid cast antique brass buckle hardware and rivets",
      "Separate side-access zippered waterproof shoe garage",
      "Reinforced padded shoulder strap with heavy load bar-tacks",
      "Dimensions conform to all airline international carry-on standards",
    ],
    priceCents: 185000, // GHS 1,850.00
    compareAtCents: 240000,
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000&auto=format&fit=crop",
    ],
    colorway: "Rich Cognac Tan",
    rating: 4.98,
    ratingCount: 41,
    isNew: true,
    isFeatured: true,
    isTrending: true,
    badge: "HANDMADE",
    gender: "Unisex",
    sku: "BAG-SOV-DUF",
    approvalStatus: "approved",
    sizes: [
      { label: "45L Carry-On", stock: 8 },
    ],
  },
  {
    sellerId: 5,
    slug: "minimalist-rfid-bifold-leather-wallet",
    name: "Minimalist RFID Bifold Calfskin Wallet",
    brand: "ARTISAN LEATHER CO.",
    category: "bags",
    subCategory: "Wallets",
    description: "Slim profile pocket wallet crafted with French Boxcalf leather and woven Kevlar RFID blocking shield. Holds 8-10 cards and full unfolded banknotes.",
    features: [
      "Ultra-Slim 9mm profile when fully loaded",
      "Certified RFID / NFC blocking security layer",
      "Hand-beveled and edge-painted burnished borders",
      "Dedicated quick-access front card thumb slot",
    ],
    priceCents: 32000,
    compareAtCents: 45000,
    images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606503828359-29177a64115e?q=80&w=1000&auto=format&fit=crop",
    ],
    colorway: "Espresso Brown",
    rating: 4.87,
    ratingCount: 63,
    isNew: false,
    isFeatured: false,
    isTrending: true,
    badge: "POPULAR",
    gender: "Unisex",
    sku: "BAG-WAL-RFID",
    approvalStatus: "approved",
    sizes: [
      { label: "Standard Bifold", stock: 40 },
    ],
  },
  {
    sellerId: 5,
    slug: "smoked-amber-oud-extrait",
    name: "Smoked Amber & Royal Oud Extrait De Parfum",
    brand: "ARTISAN LEATHER CO.",
    category: "perfumes",
    subCategory: "Extrait",
    description: "Concentrated 35% oil extrait featuring top notes of smoked Calabrian bergamot and pink pepper, blooming into rare Cambodian oud, ambergris, and bourbon vanilla.",
    features: [
      "High concentration 35% Extrait De Parfum (16+ hours longevity)",
      "Artisanal small-batch maceration in Grasse, France",
      "Heavy black crystal flacon with magnetic Zamak cap",
      "Unisex signature fragrance with commanding sillage",
    ],
    priceCents: 62000, // GHS 620.00
    compareAtCents: 85000,
    images: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=1000&auto=format&fit=crop",
    ],
    colorway: "Amber Nectar Gold",
    rating: 4.96,
    ratingCount: 37,
    isNew: true,
    isFeatured: true,
    isTrending: true,
    badge: "NICHE SCENT",
    gender: "Unisex",
    sku: "PRF-OUD-EXT",
    approvalStatus: "approved",
    sizes: [
      { label: "50ml Flacon", stock: 16 },
      { label: "100ml Flacon", stock: 12 },
    ],
  },
];
