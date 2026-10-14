import { Course, JobVacancy, GigWorker, BusinessTransaction, InventoryItem, CustomerCredit, UserProfile } from '../types';

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-phone-repair',
    title: 'Smartphone Hardware & Screen Repair',
    category: 'technical',
    categoryLabel: 'Technical Trades',
    description: 'Master diagnostics, broken digitizer replacement, soldering charging ports, and battery servicing without costly tools.',
    durationHours: 6,
    difficulty: 'Beginner',
    storageSizeMb: 3.8,
    isDownloaded: true,
    lessons: [
      {
        id: 'pr-l1',
        title: 'Essential Toolkit & Safety Precautions',
        durationMinutes: 25,
        storageMb: 0.8,
        content: [
          'Overview of required low-cost tools: Precision screwdriver set (#000, Pentalobe, Torx), plastic spudgers, heat gun or hair dryer, isopropyl alcohol 99%, ESD anti-static mat or wrist strap.',
          'Safety first: Always disconnect the battery connector first before probing or touching any flex cables to prevent motherboard short-circuits.',
          'Organizing screws: Magnetic screw mat or an egg carton. Placing an M1.2 screw into an M1.0 hole will crack the underlying trace lines in the logic board.'
        ],
        practicalTip: 'In Bulawayo, you can source replacement screwdrivers and tweezers affordably around Lobengula Street and 5th Avenue hardware vendors.',
        audioSummary: 'Listen to the 3-minute diagnostic checklist before opening any customer phone.',
        quiz: [
          {
            id: 'q1',
            question: 'What is the very first step immediately after opening any phone chassis?',
            options: ['Remove the camera module', 'Disconnect the battery flex cable', 'Unscrew the logic board', 'Turn up the heat gun'],
            correctIndex: 1,
            explanation: 'Disconnecting the battery prevents short circuits from tools or fingers accidentally touching exposed power rails.'
          },
          {
            id: 'q2',
            question: 'Why should different screw lengths never be mixed up?',
            options: ['They have different colors', 'Long screws can pierce motherboard traces (long screw damage)', 'Screws lose magnetism', 'It violates warranty rules'],
            correctIndex: 1,
            explanation: 'Driving a long screw into a short screw standoff will bore into the PCB layers and cause permanent board death.'
          }
        ]
      },
      {
        id: 'pr-l2',
        title: 'LCD & OLED Screen Replacement Step-by-Step',
        durationMinutes: 40,
        storageMb: 1.2,
        content: [
          'Pre-testing the new replacement screen BEFORE gluing or sealing the phone. Plug in flex cables loosely, power on, and test touch across all 4 screen corners.',
          'Heat application: Apply even 70°C–80°C heat along phone bezel perimeter for 2 minutes to soften factory adhesive.',
          'Using suction cup and thin guitar picks to slice adhesive without cutting the display or digitizer flex ribbons.',
          'Frame cleaning: Scrape all old glue off the bezel completely using alcohol. Any remaining glass fragment will crack the new screen upon compression.'
        ],
        practicalTip: 'Use B-7000 or T-7000 adhesive sparingly. Let it cure under gentle rubber bands for 45 minutes.',
        quiz: [
          {
            id: 'q3',
            question: 'When should you test the functionality of a replacement screen?',
            options: ['After fully gluing it in', 'Before applying any adhesive or tearing factory seals', 'Only if the phone fails to turn on', 'After 24 hours of usage'],
            correctIndex: 1,
            explanation: 'Always test touch sensitivity, brightness, and colors before installing adhesive, as vendors do not accept returns once glued.'
          }
        ]
      },
      {
        id: 'pr-l3',
        title: 'Micro-USB & Type-C Charging Port Soldering',
        durationMinutes: 45,
        storageMb: 1.8,
        content: [
          'Differentiating daughterboard sub-cards versus direct board soldering.',
          'Using low-melt solder flux to desolder damaged micro-USB pins cleanly.',
          'Aligning anchor legs and checking connectivity with a digital multimeter in continuity mode.'
        ],
        practicalTip: 'Many popular entry-level Androids (Itel, Tecno, Samsung A-series) use modular daughter boards that can be swapped without soldering.'
      }
    ],
    careerPathway: {
      recommendedJobTitle: 'Mobile Hardware Technician',
      recommendedGigCategory: 'Phone and computer repairs',
      potentialIncomeRange: '$15 - $40 per screen replacement'
    },
    startupGuide: {
      equipmentNeeded: ['Precision screwdriver kit ($8)', 'Heat gun / hair dryer ($12)', 'B7000 adhesive ($2)', 'Multimeter ($6)'],
      suggestedPricing: 'Screen labor: $10 + part cost; Charging port: $8 - $12.',
      firstCustomerStrategy: 'Offer free phone inspections to vendors at your local market or church group to build word-of-mouth trust.'
    }
  },
  {
    id: 'course-solar-basics',
    title: 'Solar System Sizing & Inverter Installation',
    category: 'technical',
    categoryLabel: 'Technical Trades',
    description: 'Learn how to size solar panels, deep cycle batteries, and inverters to power homes and tuckshops during Zimbabwean power cuts.',
    durationHours: 8,
    difficulty: 'Intermediate',
    storageSizeMb: 4.2,
    isDownloaded: true,
    lessons: [
      {
        id: 'sol-l1',
        title: 'Calculating Daily Watt-Hour (Wh) Load',
        durationMinutes: 30,
        storageMb: 1.0,
        content: [
          'List every appliance, its rated wattage, and how many hours it runs per day.',
          'Formula: Total Watt-Hours = (Watts × Hours per day) for all devices.',
          'Accounting for inverter efficiency: Divide total watt-hours by 0.85 (85% inverter efficiency) for true load demand.'
        ],
        practicalTip: 'Always encourage LED lights (5W - 9W) rather than incandescent bulbs (60W) to reduce battery size requirements by 70%.',
        quiz: [
          {
            id: 'q-sol1',
            question: 'If a small shop runs 4 lights (10W each) for 6 hours, what is the daily consumption?',
            options: ['60 Wh', '240 Wh', '400 Wh', '120 Wh'],
            correctIndex: 1,
            explanation: '4 lights × 10W = 40W total. 40W × 6 hours = 240 Watt-hours (Wh).'
          }
        ]
      },
      {
        id: 'sol-l2',
        title: 'Lead-Acid vs. LiFePO4 Lithium Batteries',
        durationMinutes: 35,
        storageMb: 1.2,
        content: [
          'Depth of Discharge (DoD): Gel/Lead-acid batteries can only be safely discharged to 50% without damage.',
          'LiFePO4 Lithium batteries can be discharged up to 80%-90% and last over 3,000 cycles (8+ years).',
          'Series vs Parallel wiring: Series increases Voltage (12V + 12V = 24V); Parallel increases Amp-Hours (Ah).'
        ],
        practicalTip: 'Check battery terminal cleanliness every 3 months. Corrosion causes voltage drops and falsely triggers low-battery inverter alarms.'
      }
    ],
    careerPathway: {
      recommendedJobTitle: 'Solar Installation Assistant',
      recommendedGigCategory: 'Plumbing and electrical work',
      potentialIncomeRange: '$40 - $120 per home setup'
    },
    startupGuide: {
      equipmentNeeded: ['Digital multimeter', 'Cable crimper & lugs', 'Solar MC4 spanners', 'Insulated screwdrivers'],
      suggestedPricing: 'Basic 1kVA installation labor: $50 - $80; 3kVA system: $120 - $200.',
      firstCustomerStrategy: 'Partner with local solar hardware shops in Bulawayo to be on their recommended installer roster.'
    }
  },
  {
    id: 'course-spaza-tuckshop',
    title: 'Tuckshop & Vendor Cash Management',
    category: 'finance',
    categoryLabel: 'Business Finance',
    description: 'Practical cashbook recordkeeping, USD vs ZiG dual-currency accounting, inventory restocking, and curbing unpaid debtor debt.',
    durationHours: 4,
    difficulty: 'Beginner',
    storageSizeMb: 2.1,
    isDownloaded: true,
    lessons: [
      {
        id: 'spaza-l1',
        title: 'The Daily Two-Column Cashbook',
        durationMinutes: 20,
        storageMb: 0.5,
        content: [
          'Separating business cash from personal pockets: The #1 cause of small vendor failure is using business sales to pay personal daily lunch/groceries without recording.',
          'Rule of the drawer: Never take 1 dollar out of the sales tin without writing the date, purpose, and amount in the expense column.',
          'Daily reconciliation: (Opening Cash + Total Sales) - Total Expenses = Closing Cash in Hand.'
        ],
        practicalTip: 'Count your cash every evening at 6:30 PM before going home. If the numbers do not match your ledger, find the missing $1 immediately.',
        quiz: [
          {
            id: 'q-spz1',
            question: 'Why should a tuckshop owner keep business cash strictly separate from household money?',
            options: ['Banks require it', 'To avoid unknowingly eating your working capital / stock restock money', 'Because USD is illegal', 'To pay fewer taxes'],
            correctIndex: 1,
            explanation: 'Mixing personal and business cash leads to spending restocking money, leaving empty shelves within 2 months.'
          }
        ]
      },
      {
        id: 'spaza-l2',
        title: 'Managing Customer Credit (Zvikwereti / Izikwelede)',
        durationMinutes: 30,
        storageMb: 0.7,
        content: [
          'Setting a maximum credit ceiling per customer (e.g. no more than $5).',
          'Creating a clear debtor book with customer full name, house number, cell phone, and promised pay date.',
          'Polite WhatsApp reminder templates that maintain neighborhood goodwill while securing your cash.'
        ],
        practicalTip: 'Comfort Hub includes a built-in Debtors Book with 1-tap WhatsApp payment reminder generation!'
      }
    ],
    careerPathway: {
      recommendedJobTitle: 'Tuckshop Manager / Retail Clerk',
      recommendedGigCategory: 'Small Business Tools',
      potentialIncomeRange: '$180 - $350 / month'
    }
  },
  {
    id: 'course-tailoring-garments',
    title: 'Professional Garment Construction & Tailoring',
    category: 'home',
    categoryLabel: 'Home & Craft Services',
    description: 'Learn pattern cutting, sewing machine maintenance, dressmaking, and profitable school uniform and curtain production.',
    durationHours: 7,
    difficulty: 'Intermediate',
    storageSizeMb: 3.5,
    isDownloaded: false,
    lessons: [
      {
        id: 'tail-l1',
        title: 'Operating & Oiling Manual and Electric Sewing Machines',
        durationMinutes: 30,
        storageMb: 0.9,
        content: [
          'Tension dial calibration: How to balance upper thread and bobbin thread to prevent bunching.',
          'Weekly cleaning: Removing lint from the feed dogs and oiling the shuttle race.',
          'Needle sizing: 70/10 for lightweight chiffons, 90/14 for cottons and school uniforms, 110/18 for denim and heavy canvas.'
        ],
        practicalTip: 'Always use proper sewing machine oil (clear white). Cooking oil or motor oil will gummy up the shuttle race and ruin the machine.'
      }
    ],
    careerPathway: {
      recommendedJobTitle: 'Apparel Machinist',
      recommendedGigCategory: 'Tailoring & Craft Work',
      potentialIncomeRange: '$12 - $35 per garment'
    }
  },
  {
    id: 'course-backyard-poultry',
    title: 'Poultry & Broiler Farming for Urban Backyards',
    category: 'agriculture',
    categoryLabel: 'Agriculture',
    description: 'Raise 50 to 200 broilers in urban high-density yards, manage vaccination schedules, and sell directly to local butcheries.',
    durationHours: 5,
    difficulty: 'Beginner',
    storageSizeMb: 2.8,
    isDownloaded: false,
    lessons: [
      {
        id: 'poul-l1',
        title: 'Brooding Week 1-2: Temperature & Gumboro Vaccine',
        durationMinutes: 30,
        storageMb: 0.9,
        content: [
          'Brooder setup: Charcoal mbaula or infrared bulb, wood shavings bedding 5cm deep.',
          'Stress pack vitamins in drinking water for the first 3 days.',
          'Gumboro vaccine at day 10-12 and Newcastle vaccine at day 18-21 in clean non-chlorinated water.'
        ],
        practicalTip: 'Observe chick behavior: If they crowd under the lamp, they are cold; if they scatter to the walls panting, it is too hot.'
      }
    ],
    careerPathway: {
      recommendedJobTitle: 'Poultry Producer',
      recommendedGigCategory: 'Agriculture & Produce Sales',
      potentialIncomeRange: '$1.50 - $2.20 profit per bird'
    }
  }
];

export const INITIAL_JOBS: JobVacancy[] = [
  {
    id: 'job-1',
    title: 'Junior Solar & Electrical Technician',
    companyName: 'Matabeleland Solar Solutions',
    location: 'Belmont Industrial, Bulawayo',
    city: 'Bulawayo',
    type: 'Full-time',
    industry: 'Renewable Energy & Electrical',
    salaryText: '$300 - $420 / month',
    description: 'We are seeking an energetic technician to assist our senior electricians with residential solar panel mounting, inverter setup, and troubleshooting across Bulawayo suburbs.',
    responsibilities: [
      'Install PV mounting brackets on tile and IBR roofs safely.',
      'Assist with wiring 24V/48V lithium battery banks and hybrid inverters.',
      'Conduct basic system voltage and continuity testing before commissioning.',
      'Maintain installation toolkits and customer job cards.'
    ],
    requirements: [
      'Basic certification or completed course in electrical/solar fundamentals.',
      'Physical fitness for roof and ladder work.',
      'Attention to safety protocols and neat cable trunking.',
      'Resident of Bulawayo (Belmont, Kelvin, or Western suburbs preferred).'
    ],
    isVerifiedEmployer: true,
    postedDate: '2 days ago',
    closingDate: 'In 12 days',
    contactMethod: 'Apply directly through Comfort Hub or WhatsApp HR at +263 77 234 5678',
    syncStatus: 'synced'
  },
  {
    id: 'job-2',
    title: 'Smartphone & Tablet Repair Technician',
    companyName: 'Bulawayo Digital Spares Hub',
    location: 'CBD, Bulawayo (8th Ave / Fort St)',
    city: 'Bulawayo',
    type: 'Full-time',
    industry: 'Consumer Electronics & IT',
    salaryText: '$250 base + 20% repair commission',
    description: 'Busy electronics workshop seeking a bench technician skilled in screen replacements, charging port soldering, and software flashing for Android and iOS devices.',
    responsibilities: [
      'Diagnose customer handsets and quote realistic repair timelines.',
      'Perform screen replacements, battery swaps, and microphone/speaker repairs.',
      'Log repaired devices in the workshop inventory ledger.',
      'Maintain a clean, static-free repair workstation.'
    ],
    requirements: [
      'Hands-on experience with Android (Samsung, Tecno, Itel, Redmi) hardware.',
      'Proficiency in heat gun disassembly and precision soldering.',
      'Friendly customer service demeanor.',
      'Comfort Skills Hub Phone Repair completion certificate is an advantage.'
    ],
    isVerifiedEmployer: true,
    postedDate: 'Yesterday',
    closingDate: 'In 7 days',
    contactMethod: 'Comfort Hub 1-Click Apply',
    syncStatus: 'synced'
  },
  {
    id: 'job-3',
    title: 'Retail Store Assistant & Stock Clerk',
    companyName: 'Siyaphambili Wholesalers',
    location: 'Kelvin North, Bulawayo',
    city: 'Bulawayo',
    type: 'Full-time',
    industry: 'FMCG Retail & Wholesale',
    salaryText: '$220 / month + Transport Allowance',
    description: 'Looking for a reliable, honest retail assistant to help unpack wholesale deliveries, manage shelf displays, and operate point-of-sale cash registers.',
    responsibilities: [
      'Receive incoming bulk stock deliveries and verify against delivery invoices.',
      'Replenish store shelves and ensure price tags are clear in both USD and ZiG.',
      'Assist walk-in tuckshop owners with wholesale grocery orders.',
      'Perform daily stock spot-checks to prevent shrinkage.'
    ],
    requirements: [
      'Basic numeracy and arithmetic skills.',
      'High honesty and traceable references.',
      'Ability to lift boxes up to 20kg.',
      'Basic computer or smartphone inventory literacy.'
    ],
    isVerifiedEmployer: true,
    postedDate: '3 days ago',
    closingDate: 'In 14 days',
    contactMethod: 'Comfort Hub 1-Click Apply',
    syncStatus: 'synced'
  },
  {
    id: 'job-4',
    title: 'Industrial Sewing Machinist (School Uniforms)',
    companyName: 'ZimTextiles Manufacturing',
    location: 'Steeldale, Bulawayo',
    city: 'Bulawayo',
    type: 'Contract',
    industry: 'Textiles & Garment Manufacturing',
    salaryText: '$260 - $320 / month piece-rate',
    description: 'Seasonal expansion contract for 10 skilled sewing machinists to produce term-one school skirts, shirts, and blazers on industrial lockstitch machines.',
    responsibilities: [
      'Operate high-speed single needle lockstitch and overlocker machines.',
      'Assemble garment components following master tech packs.',
      'Maintain strict stitch tension standards.'
    ],
    requirements: [
      'Proven tailoring or machining capability.',
      'Punctual and capable of meeting daily production targets.'
    ],
    isVerifiedEmployer: true,
    postedDate: '4 days ago',
    closingDate: 'In 5 days',
    contactMethod: 'Comfort Hub 1-Click Apply',
    syncStatus: 'synced'
  },
  {
    id: 'job-5',
    title: 'Urban Poultry Farm Attendant',
    companyName: 'Matopos Road Poultry Co.',
    location: 'Burnside / Hillside, Bulawayo',
    city: 'Bulawayo',
    type: 'Casual',
    industry: 'Agriculture',
    salaryText: '$190 / month + lunch provided',
    description: 'Attendant needed to care for 500 broiler chickens, handle daily feeding, clean water fonts, and assist with processing during slaughter weeks.',
    responsibilities: [
      'Provide clean drinking water with vitamins according to schedule.',
      'Keep chicken house clean, rake wood shavings and ensure proper ventilation.',
      'Record daily bird mortality and feed consumption.'
    ],
    requirements: [
      'Passion for livestock farming.',
      'Reliable, early riser (starts 7:00 AM).'
    ],
    isVerifiedEmployer: false,
    postedDate: '5 days ago',
    closingDate: 'In 9 days',
    contactMethod: 'Call +263 71 987 6543',
    syncStatus: 'synced'
  }
];

export const INITIAL_GIG_WORKERS: GigWorker[] = [
  {
    id: 'worker-1',
    name: 'Sipho Moyo',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    serviceCategory: 'Plumbing & electrical work',
    suburb: 'Bradfield & Hillside',
    city: 'Bulawayo',
    rating: 4.9,
    reviewsCount: 38,
    pricingType: 'Quotation',
    baseRateText: 'From $20 / callout',
    isAvailableToday: true,
    isVerified: true,
    completedJobsCount: 52,
    phone: '+263 77 345 6789',
    skills: ['Solar inverter setup', 'Geyser repairs', 'Backup battery wiring', 'Fault tracing'],
    about: 'Certified artisan with 6 years experience installing solar backups, fixing tripping breaker boards, and repairing borehole pumps across Bulawayo.',
    sampleWorkPhotos: []
  },
  {
    id: 'worker-2',
    name: 'Nomvula Ndlovu',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    serviceCategory: 'Carpentry, welding & tailoring',
    suburb: 'Nkulumane & Western Suburbs',
    city: 'Bulawayo',
    rating: 5.0,
    reviewsCount: 24,
    pricingType: 'Fixed',
    baseRateText: '$15 / garment or curtain set',
    isAvailableToday: true,
    isVerified: true,
    completedJobsCount: 41,
    phone: '+263 71 876 5432',
    skills: ['Custom curtains', 'School uniform alterations', 'Cushion upholstery', 'African print dresses'],
    about: 'Experienced seamstress specializing in high quality eyelet curtains, traditional wedding wear, and school uniforms with fast turnarounds.',
    sampleWorkPhotos: []
  },
  {
    id: 'worker-3',
    name: 'Tinashe Chiduku',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    serviceCategory: 'Phone & computer repairs',
    suburb: 'CBD & Montrose',
    city: 'Bulawayo',
    rating: 4.8,
    reviewsCount: 44,
    pricingType: 'Hourly',
    baseRateText: '$10 / repair diagnostic',
    isAvailableToday: false,
    isVerified: true,
    completedJobsCount: 76,
    phone: '+263 78 456 1234',
    skills: ['Samsung screen replacement', 'iPhone charging ports', 'Laptop OS reinstallation', 'Data recovery'],
    about: 'Graduate of Bulawayo Poly with specialized micro-soldering gear. Quick screen swaps in 45 minutes.',
    sampleWorkPhotos: []
  },
  {
    id: 'worker-4',
    name: 'Bongani Sibanda',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    serviceCategory: 'Plumbing & electrical work',
    suburb: 'Cowdray Park & Luveve',
    city: 'Bulawayo',
    rating: 4.9,
    reviewsCount: 19,
    pricingType: 'Quotation',
    baseRateText: 'From $25 / job',
    isAvailableToday: true,
    isVerified: true,
    completedJobsCount: 29,
    phone: '+263 77 654 3210',
    skills: ['Water tank plumbing', 'Booster pumps', 'Toilet cistern fixes', 'Copper pipe brazing'],
    about: 'Reliable plumber handling JoJo tank installations, leak detections, and drain unblocking in Western suburbs.',
    sampleWorkPhotos: []
  },
  {
    id: 'worker-5',
    name: 'Thandiwe Khumalo',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    serviceCategory: 'Cleaning & laundry',
    suburb: 'Suburbs, Kumalo & Malindela',
    city: 'Bulawayo',
    rating: 5.0,
    reviewsCount: 31,
    pricingType: 'Daily',
    baseRateText: '$25 - $30 / full day',
    isAvailableToday: true,
    isVerified: true,
    completedJobsCount: 68,
    phone: '+263 77 999 1122',
    skills: ['Deep house cleaning', 'Carpet shampooing', 'Move-out cleaning', 'Window washing'],
    about: 'Punctual, vetted and meticulous domestic specialist. Trusted by families and businesses across eastern Bulawayo.',
    sampleWorkPhotos: []
  }
];

export const INITIAL_TRANSACTIONS: BusinessTransaction[] = [
  {
    id: 'tx-1',
    type: 'sale',
    amount: 35.0,
    currency: 'USD',
    category: 'Phone Repair',
    description: 'Samsung A12 screen replacement labor and screen',
    date: '2026-10-14',
    paymentMethod: 'cash',
    customerOrSupplier: 'Mr. Ndebele',
    syncStatus: 'saved_locally'
  },
  {
    id: 'tx-2',
    type: 'expense',
    amount: 18.0,
    currency: 'USD',
    category: 'Stock / Spares',
    description: 'Bought Samsung A12 replacement display from 5th Ave vendor',
    date: '2026-10-14',
    paymentMethod: 'cash',
    customerOrSupplier: 'Spares Depot',
    syncStatus: 'saved_locally'
  },
  {
    id: 'tx-3',
    type: 'gig_payment',
    amount: 25.0,
    currency: 'USD',
    category: 'Electrical Work',
    description: 'Installed 5 LED floodlights for tuckshop security',
    date: '2026-10-13',
    paymentMethod: 'ecocash',
    customerOrSupplier: 'Gogo Sibanda',
    syncStatus: 'synced'
  },
  {
    id: 'tx-4',
    type: 'expense',
    amount: 5.0,
    currency: 'USD',
    category: 'Transport & Airtime',
    description: 'Kombi fare to Kelvin Industrial and NetOne airtime',
    date: '2026-10-13',
    paymentMethod: 'ecocash',
    syncStatus: 'synced'
  },
  {
    id: 'tx-5',
    type: 'sale',
    amount: 45.0,
    currency: 'USD',
    category: 'Tailoring',
    description: 'Custom curtains sewn and hemmed for 3 bedroom house',
    date: '2026-10-12',
    paymentMethod: 'innbucks',
    customerOrSupplier: 'Mrs. Dube',
    syncStatus: 'synced'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Samsung A12 / A02 LCD Screen Replacement',
    category: 'Phone Parts',
    quantity: 4,
    unitCost: 16.0,
    sellingPrice: 32.0,
    currency: 'USD',
    lowStockAlert: 2,
    lastUpdated: '2026-10-13'
  },
  {
    id: 'inv-2',
    name: 'B-7000 Precision Phone Glue (50ml tube)',
    category: 'Repair Tools',
    quantity: 2,
    unitCost: 1.5,
    sellingPrice: 4.0,
    currency: 'USD',
    lowStockAlert: 3,
    lastUpdated: '2026-10-10'
  },
  {
    id: 'inv-3',
    name: 'Type-C Charging Sub-board (Universal)',
    category: 'Phone Parts',
    quantity: 7,
    unitCost: 2.0,
    sellingPrice: 6.0,
    currency: 'USD',
    lowStockAlert: 3,
    lastUpdated: '2026-10-12'
  },
  {
    id: 'inv-4',
    name: '6mm Twin & Earth Solar DC Cable (per meter)',
    category: 'Electrical',
    quantity: 28,
    unitCost: 0.8,
    sellingPrice: 1.5,
    currency: 'USD',
    lowStockAlert: 10,
    lastUpdated: '2026-10-09'
  },
  {
    id: 'inv-5',
    name: 'Standard Gold Singer Sewing Needles (Pack of 10)',
    category: 'Tailoring',
    quantity: 1,
    unitCost: 1.0,
    sellingPrice: 2.5,
    currency: 'USD',
    lowStockAlert: 3,
    lastUpdated: '2026-10-08'
  }
];

export const INITIAL_CUSTOMER_CREDITS: CustomerCredit[] = [
  {
    id: 'cred-1',
    customerName: 'Blessing Dube',
    phone: '+263 77 111 2233',
    amountOwed: 14.0,
    currency: 'USD',
    lastPurchaseDate: '2026-10-11',
    notes: 'Bought phone battery. Promised to clear balance this Friday after Ecocash salary.'
  },
  {
    id: 'cred-2',
    customerName: 'Melusi Khumalo',
    phone: '+263 71 444 5566',
    amountOwed: 8.5,
    currency: 'USD',
    lastPurchaseDate: '2026-10-09',
    notes: 'Curtain alteration balance. Will pay cash.'
  }
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user-self',
  fullName: 'Comfort Nyoni',
  phone: '+263 77 412 8901',
  email: 'comfort.nyoni@example.com',
  suburb: 'Nkulumane 12',
  city: 'Bulawayo',
  headline: 'Aspiring Electronics Technician & Small Business Owner',
  bio: 'Motivated Bulawayo resident passionate about smartphone repairs, practical solar solutions, and managing local trade efficiently.',
  education: 'Bulawayo Polytechnic Certificate in Basic Electronics',
  workExperience: '2 years assisting at local repair stall on 5th Avenue; freelance handyman.',
  skills: ['Smartphone Screen Replacement', 'Basic Soldering', 'Solar Wiring', 'Cashbook Recordkeeping', 'Customer Service'],
  references: 'Mr. T. Moyo (Workshop Owner, +263 77 222 3344)',
  roles: ['learner', 'jobseeker', 'worker', 'business_owner'],
  isWorkerProfileActive: true,
  workerTrade: 'Phone and computer repairs',
  workerRate: '$10 - $25 per repair'
};
