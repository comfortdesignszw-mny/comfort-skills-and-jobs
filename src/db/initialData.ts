import { 
  Course, 
  JobVacancy, 
  GigWorker, 
  BusinessTransaction, 
  InventoryItem, 
  CustomerCredit, 
  UserProfile 
} from '../types';

export const INITIAL_COURSES: Course[] = [
  // 1. AI Fundamentals
  {
    id: 'course-ai-fundamentals',
    title: 'AI Fundamentals & Practical Prompting',
    category: 'digital',
    categoryLabel: 'Digital & Tech Skills',
    description: 'Master artificial intelligence tools, prompt engineering, and automated workflows to accelerate freelance work, writing, business research, and small business productivity in Zimbabwe.',
    durationHours: 6,
    difficulty: 'Beginner',
    storageSizeMb: 5.2,
    isDownloaded: true,
    careerPathway: {
      recommendedJobTitle: 'AI Prompt Assistant / Digital Content Specialist',
      recommendedGigCategory: 'Digital marketing & tech support',
      potentialIncomeRange: '$180 - $450 / month'
    },
    startupGuide: {
      equipmentNeeded: ['Smartphone or basic laptop with internet access', 'Google or OpenAI account', 'Notepad for prompt templates'],
      suggestedPricing: '$10 - $25 per customized business workflow or prompt template pack',
      firstCustomerStrategy: 'Offer Bulawayo SMEs and online traders automated product descriptions and customer service response templates.'
    },
    lessons: [
      {
        id: 'ai-lesson-1',
        title: 'Core AI Concepts & Effective Prompting Architecture',
        durationMinutes: 45,
        storageMb: 1.8,
        content: [
          'Understand Large Language Models (LLMs) and how tokens predict language without consciousness.',
          'The 4-part Prompt Formula: Role + Context + Task + Constraint (e.g., "Act as a Bulawayo retail accountant, analyze this EcoCash cashbook, summarize weekly margin, output in a 3-column table").',
          'Zero-shot vs Few-shot Prompting: Providing 2-3 accurate examples to guide exact tone and format.',
          'Iterative refinement: How to follow up, ask for counter-arguments, and tighten output.'
        ],
        detailedNotes: {
          overview: 'Artificial Intelligence empowers freelancers and small businesses to generate professional documentation, marketing copy, and automated spreadsheets in seconds.',
          corePrinciples: [
            'Role Prompting: Always assign an expert persona to activate domain-specific vocabulary.',
            'Delimiters: Use triple quotes or markdown formatting to separate input data from instructions.',
            'Hallucination Mitigation: Always instruct the model: "If the answer cannot be determined from provided data, state that you do not know."'
          ],
          safetyProtocols: [
            'Never paste confidential business passwords, bank PINs, or sensitive customer identity documents into public AI chat windows.',
            'Verify all numerical calculations independently before submitting financial tenders.'
          ],
          troubleshootingTips: [
            'If output is too generic, supply concrete examples of the style or length you want.',
            'If the model cuts off midway, simply prompt "Continue from the last sentence."'
          ],
          zimbabweContext: 'In Zimbabwe, AI helps freelancers bid competitively on global platforms (Upwork, Fiverr) and assists informal traders in crafting professional invoices and business proposals for banks and microfinance institutions.'
        },
        visualDiagram: {
          id: 'diag-ai-1',
          title: 'The Professional Prompt Engineering Architecture',
          caption: '4-Step framework for commanding AI models without hallucinations.',
          svgType: 'diagram',
          steps: [
            'Role Definition: "Act as an expert vocational trainer"',
            'Context Injection: "For youth artisans in Bulawayo with erratic power"',
            'Task Objective: "Create a 5-step preventative maintenance checklist"',
            'Output Constraint: "In bullet points, maximum 150 words, plain English"'
          ]
        },
        practicalTip: 'Create a "Prompt Vault" in your phone notes. Whenever you find a prompt that generates good results, save it for one-tap reuse.',
        resources: [
          {
            title: 'SME Prompt Cheatsheet',
            type: 'cheatsheet',
            description: '20 high-converting prompt templates for marketing, bookkeeping, and customer queries.',
            keyPoints: ['Social media captions', 'Cold pitch emails to local shops', 'Inventory reorder calculations']
          }
        ],
        quiz: [
          {
            id: 'ai-q1',
            question: 'What is the most effective structure for a professional AI prompt?',
            options: ['Just one sentence asking a vague question', 'Role + Context + Specific Task + Constraints', 'Typing in ALL CAPS', 'Asking the model to guess your business needs'],
            correctIndex: 1,
            explanation: 'The 4-part framework (Role, Context, Task, Constraints) produces the most accurate and context-aware responses.'
          },
          {
            id: 'ai-q2',
            question: 'Why should you avoid pasting sensitive financial PINs or customer passwords into public AI tools?',
            options: ['It slows down your smartphone', 'Data privacy and security risk of leaking credentials', 'The AI will delete the account', 'It costs extra tokens'],
            correctIndex: 1,
            explanation: 'Public AI prompts may be retained for model retraining. Never share credentials or confidential PII.'
          },
          {
            id: 'ai-q3',
            question: 'What is "few-shot prompting"?',
            options: ['Prompting only a few times a week', 'Providing 2 to 3 practical input-output examples inside your prompt', 'Using a model that has few parameters', 'Generating short summaries'],
            correctIndex: 1,
            explanation: 'Few-shot prompting provides examples to guide the AI model to match your desired structure and tone.'
          },
          {
            id: 'ai-q4',
            question: 'How can you prevent an AI model from hallucinating false business statistics?',
            options: ['Ask it repeatedly until it changes', 'Instruct it to rely strictly on provided source text and state "I do not know" if uncertain', 'Turn off phone Wi-Fi', 'Use slang'],
            correctIndex: 1,
            explanation: 'Explicit constraints and grounding instructions prevent the model from inventing non-existent facts.'
          },
          {
            id: 'ai-q5',
            question: 'How can a Bulawayo informal trader best utilize AI tools today?',
            options: ['To replace all human employees immediately', 'To quickly draft price lists, customer SMS reminders, supplier inquiry letters, and social media posts', 'To print fake dollar notes', 'To mine cryptocurrency'],
            correctIndex: 1,
            explanation: 'AI provides massive leverage for everyday business communication, customer service, and proposal drafting.'
          }
        ]
      }
    ]
  },

  // 2. Cyber Security
  {
    id: 'course-cyber-security',
    title: 'Cyber Security & Mobile Banking Protection',
    category: 'digital',
    categoryLabel: 'Digital & Tech Skills',
    description: 'Protect your money, mobile wallets (EcoCash, Innbucks, O’Mari), social media accounts, and business records from SIM swaps, phishing attacks, malware, and digital scams in Zimbabwe.',
    durationHours: 8,
    difficulty: 'Beginner',
    storageSizeMb: 6.0,
    isDownloaded: true,
    careerPathway: {
      recommendedJobTitle: 'Junior IT Support / Cyber Hygiene Technician',
      recommendedGigCategory: 'Digital marketing & tech support',
      potentialIncomeRange: '$200 - $500 / month'
    },
    startupGuide: {
      equipmentNeeded: ['Smartphone with updated Android OS', 'Authenticator App (Google or Microsoft)', 'Password Manager notebook'],
      suggestedPricing: '$15 - $30 per device audit and 2FA lockdown for small business offices',
      firstCustomerStrategy: 'Help local tuckshops and schools audit their staff WhatsApp groups and mobile banking device security.'
    },
    lessons: [
      {
        id: 'sec-lesson-1',
        title: 'Mobile Wallet Defense, SIM Swap Traps & Phishing Identification',
        durationMinutes: 50,
        storageMb: 2.1,
        content: [
          'The anatomy of a SIM swap: How scammers spoof Econet or NetOne agent identities.',
          'Mobile Money Rules: Never reveal EcoCash or Innbucks OTPs or PINs to anyone claiming to be "Customer Care".',
          'Spotting fake WhatsApp links and lottery scams promising free groceries or fuel vouchers.',
          'Setting up SIM card PINs in Android settings to lock the chip if the phone is stolen.'
        ],
        detailedNotes: {
          overview: 'Mobile money is the primary financial lifeline in Zimbabwe. Attackers use social engineering rather than technical hacking to steal funds.',
          corePrinciples: [
            'Zero Trust for Inbound Calls: Real bank officials never request your 4-digit PIN or SMS OTP over the phone.',
            'Hardware SIM Locking: Configure your SIM card with a custom 4-digit PIN so a thief cannot insert your SIM into another device to receive banking OTPs.',
            'Two-Factor Authentication (2FA): Always enable 2FA on WhatsApp and Gmail using app authenticators rather than SMS.'
          ],
          safetyProtocols: [
            'Immediately notify your service provider (Econet, NetOne, Telecel) if your phone suddenly loses signal without explanation.',
            'Do not click shortened URLs (bit.ly, tinyurl) sent via SMS claiming your account is locked.'
          ],
          troubleshootingTips: [
            'If your WhatsApp is hijacked, email support@whatsapp.com with "Lost/Stolen: Please deactivate my account" and your number in +263 format.',
            'Check active sessions in WhatsApp Settings > Linked Devices weekly.'
          ],
          zimbabweContext: 'In Bulawayo and Harare, informal traders frequently fall victim to fake EcoCash reversal SMS scams where customers fake proof of payment. Always check your actual wallet balance!'
        },
        visualDiagram: {
          id: 'diag-sec-1',
          title: '3-Layer Mobile Money Defense Shield',
          caption: 'Essential security checkpoints to protect funds on Zimbabwean mobile wallets.',
          svgType: 'safety',
          steps: [
            'Step 1: Set Device Screen Lock (Biometric / Complex PIN)',
            'Step 2: Enable SIM Card PIN in Android Settings',
            'Step 3: Never share 4-digit USSD PIN or SMS OTP with anyone'
          ]
        },
        practicalTip: 'Go to Android Settings > Security > SIM Card Lock right now. Change the default PIN (usually 1111 or 0000) to your own secret code.',
        resources: [
          {
            title: 'Digital Scam Identification Checklist',
            type: 'checklist',
            description: 'Red flags for fake payment messages and phishing calls.',
            keyPoints: ['Verify sender number', 'Check real USSD balance', 'Inspect link domain ending']
          }
        ],
        quiz: [
          {
            id: 'sec-q1',
            question: 'A caller claiming to be an Econet network technician asks for your one-time SMS PIN to fix poor network. What should you do?',
            options: ['Give them the PIN immediately', 'Never share your PIN/OTP under any circumstances and end the call', 'Ask for their employee ID and then give it', 'Post the PIN on Facebook'],
            correctIndex: 1,
            explanation: 'Telecommunication and bank agents will NEVER ask for your secret PIN or OTP. Sharing it allows attackers to compromise your account.'
          },
          {
            id: 'sec-q2',
            question: 'Why should you configure a SIM PIN on your phone?',
            options: ['It makes internet browsing faster', 'It prevents thieves from taking out your SIM and receiving your banking OTPs on another phone', 'It reduces call rates', 'It enables 5G'],
            correctIndex: 1,
            explanation: 'If a stolen phone has an unlocked SIM, criminals can insert it into another handset and access linked mobile wallets.'
          },
          {
            id: 'sec-q3',
            question: 'A customer shows you an SMS on their phone saying they sent $50 to your EcoCash. How should you verify it?',
            options: ['Trust the customer and hand over the goods', 'Dial *151# or check your own phone wallet to verify the balance actually increased', 'Ask their name', 'Take a photo of their phone screen'],
            correctIndex: 1,
            explanation: 'Scammers can send spoofed SMS messages. You must always confirm incoming funds on your own device balance.'
          },
          {
            id: 'sec-q4',
            question: 'What is the strongest password practice for your business email and social media?',
            options: ['Using "123456" for everything', 'Using your pet’s name and birth year', 'A unique, long passphrase with two-factor authentication (2FA) enabled', 'Writing it on a sticker on your monitor'],
            correctIndex: 2,
            explanation: 'Long, unique passphrases combined with 2FA prevent 99% of unauthorized automated account takeovers.'
          },
          {
            id: 'sec-q5',
            question: 'How often should you audit your WhatsApp Linked Devices?',
            options: ['Never', 'Regularly, to disconnect unknown web browsers or laptops', 'Once every 10 years', 'Only when buying a new phone'],
            correctIndex: 1,
            explanation: 'Checking Linked Devices ensures no unauthorized third party is silently reading your customer messages via WhatsApp Web.'
          }
        ]
      }
    ]
  },

  // 3. First Aid
  {
    id: 'course-first-aid',
    title: 'Emergency First Aid & Workplace Safety',
    category: 'safety',
    categoryLabel: 'Health & Safety',
    description: 'Learn life-saving first response skills for workshop accidents, CPR, severe bleeding control, electric shocks, burns, fractures, and heat exhaustion on Zimbabwean job sites.',
    durationHours: 10,
    difficulty: 'Beginner',
    storageSizeMb: 6.5,
    isDownloaded: true,
    careerPathway: {
      recommendedJobTitle: 'Certified Site Safety Officer / Workplace First Aider',
      recommendedGigCategory: 'Plumbing & electrical work',
      potentialIncomeRange: '$220 - $550 / month'
    },
    startupGuide: {
      equipmentNeeded: ['Standard First Aid Kit (gauze, triangular bandages, antiseptic, shears)', 'Latex gloves', 'CPR face shield'],
      suggestedPricing: '$20 - $40 per workplace safety inspection and kit restocking service',
      firstCustomerStrategy: 'Approach welding workshops, tuckshops, and construction contractors in Kelvin and Belmont with safety compliance packages.'
    },
    lessons: [
      {
        id: 'fa-lesson-1',
        title: 'The DRABC Emergency Action Protocol & CPR Procedure',
        durationMinutes: 55,
        storageMb: 2.2,
        content: [
          'Danger Assessment: Never become the second casualty. Check for live wires, gas leaks, and collapsing structures.',
          'Response Check: Gentle shoulder tap and verbal call ("Can you hear me?").',
          'Airway & Breathing: Tilt head, lift chin, look/listen/feel for normal chest breathing for 10 seconds.',
          'CPR Execution: 30 hard and fast chest compressions (100-120 bpm) followed by 2 rescue breaths.',
          'Severe Bleeding: Direct firm pressure using clean dressings; elevate limb above heart level.'
        ],
        detailedNotes: {
          overview: 'The first 4 minutes of a severe medical emergency determine survival. Fast, competent bystander intervention saves lives before ambulances arrive.',
          corePrinciples: [
            'DRABC System: Danger, Response, Airway, Breathing, Circulation.',
            'CPR Depth: 5 to 6 cm compression depth in the center of the adult breastbone (sternum).',
            'Electric Shock Protocol: Never touch an electrocuted victim with bare hands while they are in contact with the live current. Switch off the main breaker or use a dry wooden stick.'
          ],
          safetyProtocols: [
            'Always put on latex/nitrile gloves before touching open blood or bodily fluids.',
            'Do not apply butter, oil, or toothpaste to burn injuries; use only cool running clean water for 15-20 minutes.'
          ],
          troubleshootingTips: [
            'If you tire during CPR compressions, rotate with another trained person every 2 minutes without pausing compressions for more than 10 seconds.',
            'For chemical eye splashes, flush continuously with clean water from the inner to outer eye corner.'
          ],
          zimbabweContext: 'Local emergency numbers to keep saved: Bulawayo Ambulance (02922 71717 / 999), Fire Brigade (993 / 02922 71717), Police General Headquarters (995).'
        },
        visualDiagram: {
          id: 'diag-fa-1',
          title: 'The DRABC Emergency Primary Survey',
          caption: 'Standard life support workflow for accident scenes.',
          svgType: 'safety',
          steps: [
            'D - Danger: Scan scene for live current or traffic',
            'R - Response: Tap shoulders & shout',
            'A - Airway: Head tilt, chin lift',
            'B - Breathing: Look, listen, feel for 10 seconds',
            'C - Circulation: 30 chest compressions at 100-120 bpm'
          ]
        },
        practicalTip: 'Time CPR compressions to the rhythm of the song "Stayin Alive" by the Bee Gees (approximately 100 to 120 beats per minute).',
        resources: [
          {
            title: 'Workshop First Aid Kit Checklist',
            type: 'checklist',
            description: 'Essential items required in every Zimbabwean artisan workshop under factory safety regulations.',
            keyPoints: ['Crepe bandages', 'Sterile eye wash', 'Burn dressings', 'Antiseptic solution', 'Safety pins and shears']
          }
        ],
        quiz: [
          {
            id: 'fa-q1',
            question: 'What is the very first step in the DRABC emergency protocol?',
            options: ['Start chest compressions', 'Check for Danger to ensure the scene is safe for you', 'Give rescue breaths', 'Check the victim’s pockets'],
            correctIndex: 1,
            explanation: 'Danger check is first. If the scene is unsafe (e.g. live electrical cables), the rescuer could also become a casualty.'
          },
          {
            id: 'fa-q2',
            question: 'What is the correct ratio of chest compressions to rescue breaths for adult CPR?',
            options: ['10 compressions to 5 breaths', '30 compressions to 2 rescue breaths', '50 compressions to 1 breath', '100 compressions with no breaths'],
            correctIndex: 1,
            explanation: 'The internationally recognized standard for adult CPR is 30 chest compressions followed by 2 rescue breaths.'
          },
          {
            id: 'fa-q3',
            question: 'How should you treat a fresh thermal burn from a soldering iron or welding torch?',
            options: ['Apply motor oil or butter', 'Cool under clean running water for 15 to 20 minutes', 'Cover with sand', 'Pop any blisters with a needle'],
            correctIndex: 1,
            explanation: 'Cool running water removes heat and minimizes tissue damage. Butter or oils trap heat and cause severe infections.'
          },
          {
            id: 'fa-q4',
            question: 'A fellow worker touches an exposed 240V wire and cannot let go. What is your immediate action?',
            options: ['Grab their arm with both bare hands', 'Switch off the main circuit breaker or push them away using a dry non-conductive wooden stick', 'Pour a bucket of water over them', 'Call their relatives'],
            correctIndex: 1,
            explanation: 'Never touch a victim with bare hands while they are connected to electrical current. Disconnect power or use non-conductive dry wood.'
          },
          {
            id: 'fa-q5',
            question: 'How do you effectively manage severe arterial limb bleeding?',
            options: ['Apply firm, direct pressure over the wound with a sterile dressing and elevate the limb', 'Wash the wound with hot soapy water', 'Leave it open to the air', 'Wait 24 hours before touching it'],
            correctIndex: 0,
            explanation: 'Direct firm pressure is the fastest and most effective way to stem serious blood loss.'
          }
        ]
      }
    ]
  },

  // 4. Welding and Steel Fabrication
  {
    id: 'course-welding-fabrication',
    title: 'Welding & Steel Fabrication',
    category: 'technical',
    categoryLabel: 'Technical Trades',
    description: 'Learn Shielded Metal Arc Welding (MMA/Stick), angle grinder operation, steel gate and burglar bar fabrication, joint types, electrode selection, and workshop safety.',
    durationHours: 16,
    difficulty: 'Intermediate',
    storageSizeMb: 8.5,
    isDownloaded: true,
    careerPathway: {
      recommendedJobTitle: 'Steel Fabricator & Arc Welder',
      recommendedGigCategory: 'Plumbing & electrical work',
      potentialIncomeRange: '$300 - $800 / month'
    },
    startupGuide: {
      equipmentNeeded: ['Inverter MMA arc welder (160A-200A)', '4.5 inch Angle grinder', 'Auto-darkening helmet (Shade 9-13)', 'Welding gloves & leather apron', 'Square rule & G-clamps'],
      suggestedPricing: '$150 - $400 for sliding metal gates, $25 - $50 per standard burglar bar window',
      firstCustomerStrategy: 'Fabricate sample burglar bars and display them outside your home or workshop in high-density suburbs.'
    },
    lessons: [
      {
        id: 'weld-lesson-1',
        title: 'Arc Welding Essentials, Electrode Grades & Joint Preparation',
        durationMinutes: 60,
        storageMb: 2.8,
        content: [
          'Inverter Welder Anatomy: Current control (Amps), ground clamp polarity (DCEP vs DCEN).',
          'Electrode Selection: E6013 (general fabrication, smooth arc, easy slag removal) vs E7018 (structural load-bearing).',
          'Striking the Arc: Scratch method vs tapping method.',
          'Holding the Angle: Maintain a 70°-80° travel angle in direction of weld bead; arc length roughly equal to electrode core diameter (approx. 3mm).',
          'Essential Joint Types: Butt joint, Lap joint, Tee fillet joint, and Corner joint.'
        ],
        detailedNotes: {
          overview: 'Welding and metal fabrication is one of the highest-demand trades across Bulawayo, Harare, and growth points for perimeter gates, burglar bars, window frames, and scotch carts.',
          corePrinciples: [
            'Metal Prep: Always grind away rust, mill scale, and paint before striking an arc; dirty steel creates porosity and weak joints.',
            'Amperage Rule of Thumb: For 2.5mm E6013 rods, use 70-90 Amps. For 3.2mm rods, use 100-130 Amps.',
            'Tack Welding: Always tack your workpiece at both ends and center to prevent thermal distortion and pulling.'
          ],
          safetyProtocols: [
            'Never look at the welding arc with unprotected eyes; "arc eye" causes painful corneal burns.',
            'Ensure adequate ventilation; galvanized metal gives off toxic zinc fumes (galvanize poisoning). Wear a respirator mask when welding coated steel.'
          ],
          troubleshootingTips: [
            'Electrode sticking: You are either holding too short an arc or your amperage is set too low.',
            'Undercutting: You are traveling too fast or your current is excessively high.'
          ],
          zimbabweContext: 'Most small fabricators in Kelvin West, Sizinda, and Highfield use 200A portable inverter welders because they can run smoothly on 5kVA petrol generators during power outages.'
        },
        visualDiagram: {
          id: 'diag-weld-1',
          title: 'Arc Welding Travel Angle & Fillet Joint Anatomy',
          caption: 'Proper electrode orientation for strong weld penetration.',
          svgType: 'diagram',
          steps: [
            'Travel Angle: 70° to 80° pointed in direction of travel',
            'Work Angle: 45° bisecting the Tee fillet joint',
            'Arc Length: 2mm to 3mm steady distance',
            'Travel Speed: Uniform oval weaving motion'
          ]
        },
        practicalTip: 'Keep your E6013 electrodes in a warm, dry container. Moisture inside the flux coating causes excessive spatter and porosity.',
        resources: [
          {
            title: 'Steel Gate Sizing & Cutting List Table',
            type: 'specification',
            description: 'Standard dimensions for sliding gates, pedestrian gates, and window burglar frames.',
            keyPoints: ['25x25mm square tubing', '50x25mm perimeter frame', '12mm round bar spacing']
          }
        ],
        quiz: [
          {
            id: 'weld-q1',
            question: 'Which electrode is most commonly used for everyday sheet metal and burglar bar fabrication in Zimbabwe?',
            options: ['E6010', 'E6013', 'E9018', 'Stainless Steel 316L only'],
            correctIndex: 1,
            explanation: 'E6013 is the universal mild steel electrode for small workshops because it strikes easily and works well on thin steel tubing.'
          },
          {
            id: 'weld-q2',
            question: 'What is the primary danger of welding galvanized steel without proper ventilation or respirator?',
            options: ['It causes electric shocks', 'Inhaling toxic zinc oxide fumes causing metal fume fever', 'The welder will burn out', 'It ruins the grinder'],
            correctIndex: 1,
            explanation: 'Welding galvanized metal vaporizes zinc, creating hazardous white fumes that cause fever, nausea, and lung damage.'
          },
          {
            id: 'weld-q3',
            question: 'What happens if your welding amperage is set too high for thin square tubing?',
            options: ['The rod won’t melt', 'You will blow holes through the steel (burn-through)', 'The machine gets too cold', 'The slag will not form'],
            correctIndex: 1,
            explanation: 'Excessive amperage burns holes right through light-gauge steel tubing.'
          },
          {
            id: 'weld-q4',
            question: 'Why do welders tack-weld a frame together before laying full continuous beads?',
            options: ['To save electricity', 'To hold parts in alignment and prevent heat distortion/warping', 'To make it easier to paint', 'Because rods are too short'],
            correctIndex: 1,
            explanation: 'Tack welds secure the structural alignment so the intense heat of full welding does not pull the frame out of square.'
          },
          {
            id: 'weld-q5',
            question: 'What angle should the electrode maintain relative to the direction of travel during flat welding?',
            options: ['0 degrees flat on the table', '70° to 80° in the direction of travel', 'Directly backwards at 180°', 'Spinning constantly in circles'],
            correctIndex: 1,
            explanation: 'A 70° to 80° push/drag travel angle provides optimal penetration and clean slag coverage.'
          }
        ]
      }
    ]
  },

  // 5. Bricklaying & Masonry Construction
  {
    id: 'course-bricklaying',
    title: 'Bricklaying & Masonry Construction',
    category: 'construction',
    categoryLabel: 'Technical Trades',
    description: 'Learn residential bricklaying, mortar mixing ratios, stretcher and English bond patterns, foundation footings, leveling with water levels, and plumb line accuracy.',
    durationHours: 14,
    difficulty: 'Beginner',
    storageSizeMb: 7.2,
    isDownloaded: true,
    careerPathway: {
      recommendedJobTitle: 'Residential Bricklayer & Masonry Builder',
      recommendedGigCategory: 'Plumbing & electrical work',
      potentialIncomeRange: '$280 - $700 / month'
    },
    startupGuide: {
      equipmentNeeded: ['Brick trowel (10-11 inch)', 'Spirit level (900mm or 1200mm)', 'Plumb bob & line', 'Builder’s line and pins', 'Water level pipe'],
      suggestedPricing: '$80 - $120 per 1,000 bricks laid (labor only), or daily rate of $20 - $35',
      firstCustomerStrategy: 'Partner with building hardware stores in Bulawayo (Lupane, Cowdray Park, Emganwini) to get recommended to new plot owners.'
    },
    lessons: [
      {
        id: 'brick-lesson-1',
        title: 'Mortar Batching, Stretcher Bond & Leveling Accuracy',
        durationMinutes: 55,
        storageMb: 2.3,
        content: [
          'Mortar Mix Ratios: 1 bag of cement to 3-4 wheelbarrows of pit sand for superstructure walls.',
          'Setting the Corner Leads: Always build the corners (quoints) 4 to 5 courses high first before laying the intermediate wall.',
          'Line and Pins: Pull the string taut from corner to corner, maintaining a 1mm gap from the brick face.',
          'Joint Thickness: Consistent 10mm bed joints and perpends.',
          'Checking Plumb and Level: Use the spirit level vertically (plumb), horizontally (level), and diagonally (straight).'
        ],
        detailedNotes: {
          overview: 'Building and construction is booming in new residential suburbs (Cowdray Park, Emganwini, Rangemore, Upper Rangemore). Skilled bricklayers are consistently in demand.',
          corePrinciples: [
            'Bonding Overlap: Never allow vertical joints (perpends) to align directly on consecutive courses; maintain a half-brick (110mm) lap to distribute structural weight.',
            'Damp Proof Course (DPC): Always lay DPC plastic membrane at floor slab level to prevent ground moisture from rising up interior walls.',
            'Water-to-Cement Ratio: Mortar should be buttery and workable, not soupy. Excess water weakens compressive strength by 50%.'
          ],
          safetyProtocols: [
            'Wear heavy-duty rubber gloves; wet lime and Portland cement cause severe alkaline chemical skin burns.',
            'Erect stable scaffolding on flat wooden soleboards when working above 1.5m height.'
          ],
          troubleshootingTips: [
            'Crooked wall: You pulled the brick into contact with the line. Always leave a coin-width (1mm) gap between the brick edge and the builder line.',
            'Cracking joints: The bricks were bone-dry and sucked all the moisture from the mortar too fast. Wet bricks with clean water before laying in hot weather.'
          ],
          zimbabweContext: 'In Zimbabwe, common brick types are farm bricks (semi-burnt), commons, and solid machine-pressed wire-cuts from Montgomery or Macdonald Bricks.'
        },
        visualDiagram: {
          id: 'diag-brick-1',
          title: 'Stretcher Bond Layout & 10mm Mortar Joints',
          caption: 'Proper half-brick overlap pattern for load-bearing stability.',
          svgType: 'diagram',
          steps: [
            'Course 1: Full stretchers laid on 10mm mortar bed',
            'Course 2: Half-brick lap with perpends centered over lower brick',
            'String Line: Placed at top edge of course with 1mm clearance',
            'Spirit Level Check: Plumb vertical face every 3 courses'
          ]
        },
        practicalTip: 'Always clean your trowel and gauge board every 2 hours. Hardened mortar chunks ruin the smooth bed needed for level bricks.',
        resources: [
          {
            title: 'Cement & Sand Material Estimator Guide',
            type: 'formula',
            description: 'Accurately calculate cement bags, sand tonnage, and bricks required for any Zimbabwean house plan.',
            keyPoints: ['55 bricks per square meter (single skin)', '1 bag cement lays ~150-180 common bricks']
          }
        ],
        quiz: [
          {
            id: 'brick-q1',
            question: 'What is the standard thickness of a mortar bed joint in building construction?',
            options: ['2mm', '10mm', '35mm', '50mm'],
            correctIndex: 1,
            explanation: '10mm is the recognized building code standard for both horizontal bed joints and vertical perpends.'
          },
          {
            id: 'brick-q2',
            question: 'Why must vertical joints (perpends) never align directly in consecutive courses of a wall?',
            options: ['It looks ugly', 'It creates continuous fault lines that weaken the structural integrity and cause wall collapse', 'It uses too much cement', 'It violates paint guidelines'],
            correctIndex: 1,
            explanation: 'Staggering joints by half a brick distributes structural loads across the entire wall surface.'
          },
          {
            id: 'brick-q3',
            question: 'What is the purpose of a Damp Proof Course (DPC) membrane at slab level?',
            options: ['To keep termites out', 'To prevent ground water and dampness from rising up the walls', 'To make the bricks stick better', 'To level the foundation'],
            correctIndex: 1,
            explanation: 'DPC creates an impermeable barrier stopping rising dampness from ruining interior plaster and paint.'
          },
          {
            id: 'brick-q4',
            question: 'What tool is used to transfer an exact horizontal level across a wide 10-meter room?',
            options: ['A 15cm ruler', 'A clear water level pipe filled with water', 'A string without weights', 'A tape measure'],
            correctIndex: 1,
            explanation: 'A transparent water level pipe uses hydrostatics to establish exact level points across large distances accurately.'
          },
          {
            id: 'brick-q5',
            question: 'Why should dry clay bricks be lightly wetted before laying during hot Zimbabwean summer days?',
            options: ['To wash off all the red color', 'To prevent the dry brick from rapidly sucking moisture out of the wet mortar before it cures', 'To cool the bricklayer’s hands', 'To make them lighter to carry'],
            correctIndex: 1,
            explanation: 'Dry porous bricks absorb the mixing water from the mortar too rapidly, resulting in weak, powdery joints.'
          }
        ]
      }
    ]
  },

  // 6. Carpentry and Woodwork
  {
    id: 'course-carpentry-woodwork',
    title: 'Carpentry, Roofing & Furniture Woodwork',
    category: 'construction',
    categoryLabel: 'Technical Trades',
    description: 'Master timber cutting, roof truss assembly, wood joinery (mortise & tenon, pocket joints), cabinet fitting, hanging interior doors, and power tool operation.',
    durationHours: 15,
    difficulty: 'Intermediate',
    storageSizeMb: 7.8,
    isDownloaded: true,
    careerPathway: {
      recommendedJobTitle: 'Finish Carpenter & Roof Truss Artisan',
      recommendedGigCategory: 'Plumbing & electrical work',
      potentialIncomeRange: '$280 - $750 / month'
    },
    startupGuide: {
      equipmentNeeded: ['Circular saw or hand rip saw', 'Cordless drill & driver bits', 'Combination square & tape measure', 'Wood chisel set (6mm, 12mm, 25mm)', 'Block plane'],
      suggestedPricing: '$15 - $25 to hang a door with mortise lock; $150 - $400 for roof truss framing',
      firstCustomerStrategy: 'Offer door hanging and wardrobe shelving installations in newly completed residential developments.'
    },
    lessons: [
      {
        id: 'carp-lesson-1',
        title: 'Timber Selection, Hanging Doors & Mortise Lock Installation',
        durationMinutes: 50,
        storageMb: 2.4,
        content: [
          'Zimbabwean Timber Types: Saligna (gum), Mukwa, Teak, and Treated Pine for structural rafters.',
          'Checking Door Frame Square: Measure opposite diagonal corners (X-check); dimensions must match exactly.',
          'Trimming the Door: Plane the edges leaving 2mm gap on hinge side and 3mm on latch side.',
          'Chiseling Hinge Mortises: Score perimeter with utility knife, chisel bevel down for waste removal.',
          'Fitting Mortise Lock: Center line drilling for lock body and faceplate recess.'
        ],
        detailedNotes: {
          overview: 'Carpentry combines rough framing (roofs, ceilings) with precision joinery (kitchen cabinets, hung doors, fitted wardrobes).',
          corePrinciples: [
            'Measure Twice, Cut Once: Double check all measurements against the physical opening before cutting timber.',
            'Grain Direction: Always plane wood in the direction of the wood grain to avoid tear-out and splintering.',
            'Moisture Content: Ensure timber is kiln-dried or well-seasoned to prevent warping, twisting, or shrinking after installation.'
          ],
          safetyProtocols: [
            'Always wear safety goggles when operating high-speed circular saws or router bits.',
            'Never remove the blade guard on a power circular saw or table saw.'
          ],
          troubleshootingTips: [
            'Door binds at the bottom: Check if frame is out of plumb or shim the bottom hinge leaf with a thin cardboard spacer.',
            'Screws stripping in soft pine: Drill a small pilot hole first.'
          ],
          zimbabweContext: 'In Zimbabwe, structural roof timber must be CCA-treated (green tint) to resist local termite infestation and wood borers.'
        },
        visualDiagram: {
          id: 'diag-carp-1',
          title: 'Door Hinge Mortise & Clearance Geometry',
          caption: 'Standard 3-hinge spacing and mortise depth for residential doors.',
          svgType: 'diagram',
          steps: [
            'Top Hinge: 150mm - 180mm down from top edge',
            'Bottom Hinge: 200mm - 230mm up from bottom edge',
            'Center Hinge: Equidistant or slightly biased to top',
            'Clearance: 2mm top/hinge side, 3mm latch side, 5-8mm bottom'
          ]
        },
        practicalTip: 'Rub candle wax or soap onto wood screw threads before driving them into hard teak or mukwa; it reduces friction and prevents screw heads from snapping off.',
        resources: [
          {
            title: 'Roof Truss Pitch & Timber Spacing Chart',
            type: 'specification',
            description: 'Recommended spacing and tie-down wire standards for corrugated iron and IBR roofing sheets.',
            keyPoints: ['Truss spacing: 900mm to 1050mm center-to-center', 'Hoop iron strap anchorage']
          }
        ],
        quiz: [
          {
            id: 'carp-q1',
            question: 'Why should structural roof rafters and ceiling battens in Zimbabwe always be CCA-treated pine?',
            options: ['It makes the wood lighter', 'To protect timber against termite attacks, fungal rot, and wood borers', 'To make it fireproof', 'Because paint will not stick to untreated wood'],
            correctIndex: 1,
            explanation: 'CCA (Copper Chrome Arsenate) treatment prevents termite damage and wood decay common in subtropical climates.'
          },
          {
            id: 'carp-q2',
            question: 'How do you verify if a door frame is perfectly square before ordering or cutting a door?',
            options: ['By looking with one eye closed', 'Measure the two diagonal corners from corner to corner; both measurements must be equal', 'Tap with a hammer', 'Use a spirit level horizontally only'],
            correctIndex: 1,
            explanation: 'If the opposite diagonal corner-to-corner measurements match, the frame is geometrically square.'
          },
          {
            id: 'carp-q3',
            question: 'What is the golden rule of woodworking cutting?',
            options: ['Cut fast and ask questions later', 'Measure twice, cut once', 'Always cut shorter than the measurement', 'Use the dullest saw available'],
            correctIndex: 1,
            explanation: 'Measuring twice verifies dimensions before irreversible cuts are made.'
          },
          {
            id: 'carp-q4',
            question: 'What should you do to prevent hardwood from splitting when driving in wood screws?',
            options: ['Hammer the screw all the way in', 'Drill a pilot hole slightly smaller than the screw core diameter first', 'Soak the wood in water for a week', 'Use superglue instead'],
            correctIndex: 1,
            explanation: 'A pilot hole removes wood fibers to accommodate the screw shank without splitting dense grain.'
          },
          {
            id: 'carp-q5',
            question: 'When hand-planing a solid wood door edge, in which direction should the plane travel?',
            options: ['Across the grain at 90 degrees', 'In the direction of the wood grain to prevent tear-out', 'Backwards against the blade', 'In rapid circles'],
            correctIndex: 1,
            explanation: 'Planing with the grain produces smooth shaving without gouging or tearing wood fibers.'
          }
        ]
      }
    ]
  },

  // 7. General Motor Mechanics
  {
    id: 'course-motor-mechanics',
    title: 'General Motor Mechanics & Vehicle Servicing',
    category: 'technical',
    categoryLabel: 'Technical Trades',
    description: 'Understand 4-stroke internal combustion engines, routine lube servicing, brake pad replacements, alternator charging circuits, battery testing, and OBD2 scanner diagnostics for common vehicles in Zimbabwe (Toyota, Nissan, Honda).',
    durationHours: 18,
    difficulty: 'Intermediate',
    storageSizeMb: 9.0,
    isDownloaded: true,
    careerPathway: {
      recommendedJobTitle: 'Automotive Service Mechanic',
      recommendedGigCategory: 'Plumbing & electrical work',
      potentialIncomeRange: '$350 - $900 / month'
    },
    startupGuide: {
      equipmentNeeded: ['Socket set (8mm - 32mm with ratchet)', 'Hydraulic floor jack & safety jack stands', 'Oil filter strap wrench', 'Multimeter', 'Basic OBD2 Bluetooth scanner'],
      suggestedPricing: '$25 - $40 for basic lube service labor, $15 - $25 for front brake pad replacement',
      firstCustomerStrategy: 'Offer mobile minor servicing at residential driveways or taxi/kombi ranks in Bulawayo and Harare.'
    },
    lessons: [
      {
        id: 'mech-lesson-1',
        title: '4-Stroke Engine Principles, Oil Service & Brake Maintenance',
        durationMinutes: 65,
        storageMb: 2.9,
        content: [
          'The 4-Stroke Cycle: Intake, Compression, Power, Exhaust.',
          'Engine Oil Service: Warm engine, safely raise vehicle on jack stands, drain plug removal, oil filter replacement, filling correct viscosity (e.g. 5W-30, 15W-40).',
          'Brake Inspection & Replacement: Caliper slide pins, brake pad thickness (<3mm must replace), rotor scoring, bleeding air bubbles from brake lines.',
          'Electrical Basics: Testing 12V battery resting voltage (12.6V = full, 12.0V = discharged), testing alternator charging output (13.8V - 14.5V with engine running).',
          'OBD2 Diagnostic Scanning: Reading DTC error codes (e.g. P0300 misfire, P0420 catalytic efficiency) and interpreting live sensor data.'
        ],
        detailedNotes: {
          overview: 'The automotive fleet in Zimbabwe is predominantly pre-owned Japanese imports (Toyota Corolla, Vitz, Wish, Probox, Honda Fit). Maintaining these reliable workhorses is a lucrative, steady profession.',
          corePrinciples: [
            'Jack Stand Safety: NEVER climb beneath a vehicle supported only by a hydraulic or scissor jack. Always secure on steel jack stands.',
            'Oil Filter Gasket: Always smear clean engine oil onto the new rubber O-ring gasket before screwing the oil filter on hand-tight; never over-tighten with a tool.',
            'Brake Fluid Contamination: Brake fluid is hygroscopic (absorbs moisture from air). Bleed and replace every 2 years.'
          ],
          safetyProtocols: [
            'Allow the engine to cool before opening the radiator cap to avoid explosive boiling coolant burns.',
            'Disconnect the negative (-) battery terminal first when performing starter or alternator repairs to prevent fire sparks.'
          ],
          troubleshootingTips: [
            'Car clicks but engine does not crank: Battery voltage is below 11.8V, battery terminals are corroded, or starter solenoid is stuck.',
            'Squealing sound when braking: The wear indicator metal tab is contacting the rotor disc, signaling that brake pad friction material is finished.'
          ],
          zimbabweContext: 'Spares for common Japanese engines (1NZ-FE, 2NZ-FE, 1ZZ-FE) are readily sourced in Bulawayo CBD along 10th-12th Avenue and Kelvin industrial areas.'
        },
        visualDiagram: {
          id: 'diag-mech-1',
          title: 'The 4-Stroke Internal Combustion Cycle',
          caption: 'Piston positions and valve actions across the four distinct engine cycles.',
          svgType: 'mechanics',
          steps: [
            '1. Intake: Piston moves down, intake valve opens, air-fuel enters',
            '2. Compression: Piston moves up, both valves sealed, mixture squeezed',
            '3. Power: Spark plug ignites compressed fuel, explosion drives piston down',
            '4. Exhaust: Piston moves up, exhaust valve opens, spent gas pushed out'
          ]
        },
        practicalTip: 'Always use a copper crush washer on the oil sump drain bolt to prevent slow leaks on customer driveways.',
        resources: [
          {
            title: 'Diagnostic Trouble Code (DTC) Quick Reference',
            type: 'cheatsheet',
            description: 'Common OBD2 codes for Toyota, Honda Fit, and Nissan models in Zimbabwe.',
            keyPoints: ['P0300 - Random Misfire', 'P0171 - System Too Lean', 'P0113 - Air Intake Temp sensor']
          }
        ],
        quiz: [
          {
            id: 'mech-q1',
            question: 'What is the single most critical safety rule before getting underneath a raised vehicle?',
            options: ['Turn on the car radio', 'Never rely on a hydraulic jack alone; always support the car on rated mechanical jack stands', 'Put the hazard lights on', 'Leave the engine idling'],
            correctIndex: 1,
            explanation: 'Hydraulic jacks can fail suddenly without warning. Steel jack stands are essential to prevent crushing deaths.'
          },
          {
            id: 'mech-q2',
            question: 'What should a healthy 12-volt car battery measure with the engine turned OFF?',
            options: ['6.2 Volts', 'Approximately 12.6 Volts', '24.0 Volts', '15.5 Volts'],
            correctIndex: 1,
            explanation: 'A fully charged 12V lead-acid automotive battery measures approximately 12.6V to 12.7V when resting.'
          },
          {
            id: 'mech-q3',
            question: 'What voltage should you measure across the battery terminals when the alternator is properly charging?',
            options: ['9.0V to 10.5V', '13.8V to 14.5V', '18.0V to 22.0V', '0 Volts'],
            correctIndex: 1,
            explanation: 'A working alternator outputs 13.8V to 14.5V to recharge the battery while powering the vehicle’s electrical systems.'
          },
          {
            id: 'mech-q4',
            question: 'Why should you coat the rubber seal of a new oil filter with fresh oil before installation?',
            options: ['To wash off dust', 'To ensure a proper tight seal and prevent the rubber gasket from tearing or seizing to the block', 'To make it loose', 'To change oil color'],
            correctIndex: 1,
            explanation: 'Lubricating the O-ring prevents it from bunching up, ensuring an oil-tight seal that can be unthreaded at the next service.'
          },
          {
            id: 'mech-q5',
            question: 'What does a high-pitched squealing sound during braking usually indicate on a vehicle?',
            options: ['The car needs petrol', 'The brake pads are worn down to the acoustic wear indicators and must be replaced immediately', 'The tires have too much air', 'The radio is faulty'],
            correctIndex: 1,
            explanation: 'Brake pads contain built-in metal tabs that contact the brake rotor to alert the driver when friction lining drops below 2-3mm.'
          }
        ]
      }
    ]
  },

  // 8. Smartphone Hardware & Screen Repair
  {
    id: 'course-phone-repair',
    title: 'Smartphone Hardware & Screen Repair',
    category: 'technical',
    categoryLabel: 'Technical Trades',
    description: 'Hands-on training in diagnosing mobile hardware faults, replacing broken LCD/OLED screens, repairing USB-C/micro-USB charging ports with hot air soldering, and battery replacement in Zimbabwe.',
    durationHours: 12,
    difficulty: 'Intermediate',
    storageSizeMb: 6.8,
    isDownloaded: true,
    careerPathway: {
      recommendedJobTitle: 'Mobile Hardware Technician',
      recommendedGigCategory: 'Phone & electronics repair',
      potentialIncomeRange: '$250 - $600 / month'
    },
    startupGuide: {
      equipmentNeeded: ['Precision screwdriver set (Pentalobe, Torx, Phillips, Tri-point)', 'Hot air rework station / heat pad (set to 80°C - 90°C)', 'Isopropanol (99% IPA) & suction opener', 'Soldering iron with fine tip & flux', 'Digital multimeter'],
      suggestedPricing: '$10 - $15 labor for screen swap; $8 - $12 for charging sub-board/flex replacement',
      firstCustomerStrategy: 'Start by offering screen repairs to friends, family, and local university students in Bulawayo.'
    },
    lessons: [
      {
        id: 'phone-lesson-1',
        title: 'Diagnostics, Screen Separation & Safe Battery Isolation',
        durationMinutes: 45,
        storageMb: 2.1,
        content: [
          'Intake Inspection: Document touchscreen touch dead-zones, cameras, speaker, Wi-Fi, and IMEI before opening device.',
          'Safe Battery Disconnection: Always disconnect the battery connector first using a plastic nylon spudger to avoid motherboard short circuits.',
          'Thermal Adhesive Softening: Heat phone display perimeters evenly to 80°C for 3-4 minutes to soften waterproof adhesive.',
          'Prying Discipline: Avoid metal tools near flex cables; use thin guitar picks or plastic opening cards.',
          'Pre-assembly Testing: Test new replacement screen display and multi-touch functionality before applying permanent B-7000 or T-7000 adhesive.'
        ],
        detailedNotes: {
          overview: 'Smartphone repairs is one of the quickest self-employment pathways for youth in Bulawayo and Harare with minimal upfront capital.',
          corePrinciples: [
            'Electrostatic Discharge (ESD): Discharge static electricity before touching motherboards.',
            'Screw Management: Organize screws by length and location; putting a long screw into a short screw hole punctures motherboard traces ("long screw damage").',
            'Adhesive Selection: Use B-7000 (clear) or T-7000 (black) adhesive; clamp for at least 2 hours.'
          ],
          safetyProtocols: [
            'Never puncture a lithium-ion battery with a metal tool; it triggers thermal runaway and fire.',
            'Use only 99% anhydrous Isopropyl Alcohol (IPA) for cleaning water-damaged electronics.'
          ],
          troubleshootingTips: [
            'New screen has no touch: Reseat display FPC connector firmly until it clicks.',
            'Phone does not charge after port replacement: Inspect D+ and D- data pins for cold solder joints.'
          ],
          zimbabweContext: 'Spares for popular brands (Itel, Tecno, Infinix, Samsung Galaxy A-series, iPhone) are readily available from suppliers in Bulawayo CBD and Harare Eastgate.'
        },
        visualDiagram: {
          id: 'diag-phone-1',
          title: 'Smartphone Teardown & Screw Mapping Layout',
          caption: 'Standard disassembly sequence to prevent short circuits and board damage.',
          svgType: 'circuit',
          steps: [
            '1. Heat frame to 80°C to soften perimeter seal',
            '2. Pry gently with plastic pick; release back glass',
            '3. DISCONNECT BATTERY FIRST with nylon spudger',
            '4. Map screws onto magnetic mat in exact locations'
          ]
        },
        practicalTip: 'Always take a photo of the motherboard layout before disconnecting antennas and sub-boards so you remember the exact screw positions.',
        resources: [
          {
            title: 'Smartphone Diagnostic Checklist',
            type: 'checklist',
            description: '15-point inspection test for touch, audio, mic, sensors, and charging current before and after repair.',
            keyPoints: ['Touch digitizer test', 'Microphone recording check', 'Charging amp draw (>1.0A)']
          }
        ],
        quiz: [
          {
            id: 'phone-q1',
            question: 'What is the very first connection you must disconnect after removing the protective motherboard shield?',
            options: ['The front camera', 'The battery connector', 'The volume buttons', 'The loudspeaker'],
            correctIndex: 1,
            explanation: 'Disconnecting the battery removes all live voltage from the circuit board, preventing accidental short circuits while working.'
          },
          {
            id: 'phone-q2',
            question: 'What temperature range should a heat pad or heat gun be set to when loosening display adhesive safely?',
            options: ['20°C to 30°C', '80°C to 90°C', '300°C to 400°C', '600°C'],
            correctIndex: 1,
            explanation: '80°C to 90°C is the sweet spot that softens factory adhesives without damaging the lithium battery or melting plastic frames.'
          },
          {
            id: 'phone-q3',
            question: 'What catastrophic error occurs when you force a long screw into a short screw hole on an iPhone motherboard?',
            options: ['The screw gets rusty', '"Long screw damage" severing microscopic copper circuit traces under the screw standoff', 'The screen shines brighter', 'The battery expands'],
            correctIndex: 1,
            explanation: 'Long screw damage crushes the delicate multilayer copper traces running under the screw hole, often permanently bricking the phone.'
          },
          {
            id: 'phone-q4',
            question: 'What liquid is safe to use when cleaning corroded logic boards after liquid water damage?',
            options: ['Tap water', '99% Isopropyl Alcohol (IPA)', 'Brake fluid', 'Diesel fuel'],
            correctIndex: 1,
            explanation: '99% IPA displaces moisture and dissolves oxidation without leaving conductive mineral deposits or causing rust.'
          },
          {
            id: 'phone-q5',
            question: 'Why must you test a replacement screen before gluing it down permanently with B-7000 glue?',
            options: ['To show off to the customer', 'Once glued down, parts suppliers will void the return warranty if the screen turns out to be defective', 'Because glue ruins the pixels', 'To save battery power'],
            correctIndex: 1,
            explanation: 'Parts vendors will only exchange defective LCDs if they have not been glued and the protective film is intact.'
          }
        ]
      }
    ]
  },

  // 9. Solar PV Installation
  {
    id: 'course-solar-installation',
    title: 'Solar PV System Sizing & Installation',
    category: 'technical',
    categoryLabel: 'Technical Trades',
    description: 'Design, wire, and install domestic solar power systems for Zimbabwean homes and businesses. Covers panel sizing, MPPT charge controllers, lithium/gel batteries, inverters, and surge protection.',
    durationHours: 14,
    difficulty: 'Intermediate',
    storageSizeMb: 7.5,
    isDownloaded: true,
    careerPathway: {
      recommendedJobTitle: 'Solar Installation Technician',
      recommendedGigCategory: 'Plumbing & electrical work',
      potentialIncomeRange: '$350 - $900 / month'
    },
    startupGuide: {
      equipmentNeeded: ['Digital multimeter & clamp meter (AC/DC)', 'MC4 crimping tool & cable stripper', 'Insulated electrical screwdrivers (1000V rated)', 'Drill for roof brackets'],
      suggestedPricing: '$120 - $250 labor for a 3kVA to 5kVA domestic solar setup',
      firstCustomerStrategy: 'Target households experiencing 12-18 hour load shedding in Bulawayo and Harare suburbs.'
    },
    lessons: [
      {
        id: 'solar-lesson-1',
        title: 'Load Audits, Panel Series/Parallel Wiring & Battery Safeguards',
        durationMinutes: 60,
        storageMb: 2.5,
        content: [
          'Daily Energy Audit: Wattage calculation (Watts × Hours = Watt-hours/day).',
          'Solar Panel Stringing: Series wiring increases Voltage; Parallel wiring increases Current (Amps).',
          'MPPT Voltage Window: Ensuring string Voc does not exceed inverter maximum input voltage in cold morning weather.',
          'Battery Chemistry: Lithium LiFePO4 (80%-90% depth of discharge) vs Lead-Acid/Gel (50% depth of discharge).',
          'Protection Devices: DC circuit breakers, AC changeover switches, surge protection devices (SPDs), and earth grounding.'
        ],
        detailedNotes: {
          overview: 'Erratic grid supply makes solar power a non-negotiable necessity across Zimbabwe. Certified installers earn steady income.',
          corePrinciples: [
            'Cable Sizing: Use minimum 4mm² or 6mm² UV-resistant solar cables to prevent resistive voltage drop.',
            'DC Arc Hazard: DC electricity maintains dangerous sustained arcs. Always use DC-rated isolators, never AC breakers on solar panel strings.',
            'Lightning & Earth Rods: Drive a 1.5m copper-clad earth rod into moist ground to safely route atmospheric surges away from expensive inverters.'
          ],
          safetyProtocols: [
            'Cover solar panels with a blanket or cardboard while connecting cables to avoid shock from high open-circuit voltage (Voc).',
            'Always connect batteries to the inverter BEFORE connecting solar panels to avoid burning out the internal charge controller.'
          ],
          troubleshootingTips: [
            'Inverter displays Error 08: Bus voltage too high; check panel string voltage with multimeter.',
            'Batteries draining too fast: Check depth of discharge setting or inspect for parasitic inverter standby loads.'
          ],
          zimbabweContext: 'In Zimbabwe, 3kVA (24V) and 5kVA (48V) hybrid inverters are the market standard for powering lights, refrigerators, Wi-Fi routers, and entertainment systems.'
        },
        visualDiagram: {
          id: 'diag-solar-1',
          title: 'Hybrid Solar PV & Battery Schematic',
          caption: 'Complete safe interconnection for hybrid inverters and domestic distribution boards.',
          svgType: 'circuit',
          steps: [
            'Panels -> DC Surge Protector -> DC Isolator -> Inverter Solar Input',
            'Battery Bank -> DC Fuse Breaker -> Inverter Battery Terminals',
            'Grid / Generator Input -> AC Changeover Switch -> Inverter AC In',
            'Inverter AC Out -> Dedicated Sub-DB / Essential Loads'
          ]
        },
        practicalTip: 'Always tighten battery cable lugs with a torque wrench or firm spanner. Loose battery terminals cause overheating, arcing, and melted plastic casings.',
        resources: [
          {
            title: 'Solar Sizing Worksheet & Formulas',
            type: 'formula',
            description: 'Formula table to calculate battery Amp-hours and panel wattage for any household load.',
            keyPoints: ['Total Daily Wh ÷ (Peak Sun Hours × 0.8 efficiency)', 'Battery Ah = (Wh ÷ System Voltage) ÷ DoD']
          }
        ],
        quiz: [
          {
            id: 'solar-q1',
            question: 'When connecting two 400W solar panels in SERIES, what happens to the electrical parameters?',
            options: ['Voltage doubles while Amperage remains the same', 'Amperage doubles while Voltage remains the same', 'Both Voltage and Amperage drop to zero', 'The panels turn off'],
            correctIndex: 0,
            explanation: 'Connecting PV modules in series adds their voltages together while the current (Amps) stays constant.'
          },
          {
            id: 'solar-q2',
            question: 'In what sequence should you connect components to a solar hybrid inverter during installation?',
            options: ['Connect Solar Panels first, then turn on AC loads, connect batteries last', 'Connect Battery bank first, then configure settings, then connect Solar and AC inputs', 'Turn on grid power before anything else', 'Sequence does not matter'],
            correctIndex: 1,
            explanation: 'Connecting the battery bank first stabilizes the inverter control board before high-voltage solar strings are energized.'
          },
          {
            id: 'solar-q3',
            question: 'Why should you never use standard AC mini-circuit breakers on DC solar panel strings?',
            options: ['They are too cheap', 'DC current does not cross zero voltage, creating a sustained fire arc that AC breakers cannot extinguish', 'AC breakers have the wrong color', 'Because panels need ZiG currency'],
            correctIndex: 1,
            explanation: 'DC current maintains a continuous electric arc that quickly burns out AC breaker contacts, presenting a severe fire risk.'
          },
          {
            id: 'solar-q4',
            question: 'What is the recommended safe Depth of Discharge (DoD) for conventional Lead-Acid / Gel batteries to ensure good lifespan?',
            options: ['100% complete drain', '50% maximum drain', '5% only', '95%'],
            correctIndex: 1,
            explanation: 'Discharging Lead-Acid or Gel batteries below 50% causes premature plate sulfation and drastically shortens battery life.'
          },
          {
            id: 'solar-q5',
            question: 'What is the typical average Peak Sun Hours per day used for solar design calculations in Zimbabwe?',
            options: ['1 to 2 hours', '5 to 6 hours', '12 hours', '24 hours'],
            correctIndex: 1,
            explanation: 'Zimbabwe enjoys world-class solar irradiance averaging 5 to 6 peak sun hours per day throughout the year.'
          }
        ]
      }
    ]
  },

  // 10. Garment Construction & Tailoring
  {
    id: 'course-tailoring',
    title: 'Garment Construction & Tailoring',
    category: 'home',
    categoryLabel: 'Home & Craft Services',
    description: 'Learn pattern drafting, industrial lockstitch and overlocker machine operation, garment alterations, African print (chitenge/ankara) design, and school uniform manufacturing.',
    durationHours: 14,
    difficulty: 'Beginner',
    storageSizeMb: 6.2,
    isDownloaded: true,
    careerPathway: {
      recommendedJobTitle: 'Professional Tailor & Garment Artisan',
      recommendedGigCategory: 'Tailoring & fashion design',
      potentialIncomeRange: '$200 - $600 / month'
    },
    startupGuide: {
      equipmentNeeded: ['Sewing machine (manual Singer or industrial lockstitch)', 'Fabric shears & pinking shears', 'Tailor’s measuring tape & chalk', 'Steam iron'],
      suggestedPricing: '$15 - $35 for custom dressmaking, $2 - $5 for school uniform alterations',
      firstCustomerStrategy: 'Make school uniforms before each school term in January and September.'
    },
    lessons: [
      {
        id: 'tailor-lesson-1',
        title: 'Machine Threading, Body Measurements & School Uniform Cutting',
        durationMinutes: 50,
        storageMb: 2.2,
        content: [
          'Lockstitch Machine Mechanics: Needle bar insertion, bobbin winding, and tension dial adjustments.',
          'Precise Anatomical Measurements: Bust/Chest, Waist, Hip, Shoulder-to-Waist, and Hem lengths.',
          'Fabric Grainline & Layout: Cutting along the straight grain to prevent fabric twisting after washing.',
          'Seam Allowances: 1.5cm for standard side seams, 4cm for hem folds.',
          'School Uniform Construction: Collars, button plackets, and box pleats.'
        ],
        detailedNotes: {
          overview: 'Tailoring in Zimbabwe is a high-demand evergreen business. School uniforms, church uniforms, workwear overalls, and traditional wedding attire drive year-round cashflow.',
          corePrinciples: [
            'Tension Harmony: Balanced upper and lower thread tension creates interlocked knots inside the fabric thickness rather than loops on either side.',
            'Press As You Sew: Pressing every seam open with an iron before crossing it with another seam makes the difference between amateur and professional garments.'
          ],
          safetyProtocols: [
            'Keep fingers clear of the needle plate; keep your foot off the electric motor pedal when threading needles.'
          ],
          troubleshootingTips: [
            'Thread bunching up under the fabric (birdnesting): Upper thread is not seated properly inside the tension discs.',
            'Skipped stitches: Needle is blunt, bent, or inserted backwards.'
          ],
          zimbabweContext: 'School uniforms in January and May generate the largest bulk sewing contracts for local tailors across Bulawayo suburbs.'
        },
        visualDiagram: {
          id: 'diag-tailor-1',
          title: 'Standard Body Measurement Points & Seam Lines',
          caption: 'Essential anatomical measurement locations for tailored garments.',
          svgType: 'diagram',
          steps: [
            '1. Chest/Bust: Measured around fullest part of chest',
            '2. Natural Waist: Measured at narrowest waist bend',
            '3. Hips: Measured around fullest point of buttocks',
            '4. Back Length: From prominent neck bone to natural waistline'
          ]
        },
        practicalTip: 'Always pre-wash cotton and African wax fabrics before cutting to preshrink them so the finished dress does not become too tight after the first customer wash.',
        resources: [
          {
            title: 'School Uniform Size Spec Sheet',
            type: 'specification',
            description: 'Standard dimensions for primary and secondary school shirts, shorts, and tunics.',
            keyPoints: ['Collar neck sizes', 'Chest measurements', 'Sleeve lengths']
          }
        ],
        quiz: [
          {
            id: 'tailor-q1',
            question: 'What causes thread to bunch up in a messy knot underneath the fabric ("birdnesting") on a sewing machine?',
            options: ['The needle is too sharp', 'The upper thread is not threaded through the tension discs or take-up lever properly', 'The fabric is too clean', 'The pedal is pressed too softly'],
            correctIndex: 1,
            explanation: 'When the upper thread lacks proper tension, the bobbin hook pulls excess thread into an uncontrolled tangle beneath the needle plate.'
          },
          {
            id: 'tailor-q2',
            question: 'Why should 100% cotton African print (chitenge) fabrics be pre-washed before cutting and sewing?',
            options: ['To change the color', 'To allow the fabric to shrink naturally before cutting so the finished garment will not shrink on the customer', 'To make it softer for the machine', 'Because it is dirty'],
            correctIndex: 1,
            explanation: 'Cotton fabrics can shrink by 3% to 5% on the first wash. Pre-washing ensures the garment stays true to size.'
          },
          {
            id: 'tailor-q3',
            question: 'What is the standard seam allowance typically added to garment pattern edges?',
            options: ['0 millimeters', '1.5 centimeters (approx. 5/8 inch)', '10 centimeters', '1 meter'],
            correctIndex: 1,
            explanation: '1.5cm (5/8 inch) is the universal industry standard seam allowance for clothing construction.'
          },
          {
            id: 'tailor-q4',
            question: 'Why is it critical to "press as you sew" with an iron during garment construction?',
            options: ['To dry the fabric', 'It creates crisp, professional flat seams and prevents bulky puckered seams', 'To sanitize the thread', 'To save electricity'],
            correctIndex: 1,
            explanation: 'Pressing each seam as it is completed sets the stitches into the cloth, producing crisp, professional tailoring.'
          },
          {
            id: 'tailor-q5',
            question: 'Which needle type should you use when sewing stretchy knit fabrics like T-shirts or school tracksuits?',
            options: ['Leather chisel needle', 'Ballpoint / Jersey needle', 'Hand sewing needle', 'Heavy embroidery needle'],
            correctIndex: 1,
            explanation: 'Ballpoint needles push between knit fibers rather than piercing and tearing them, preventing skipped stitches and holes.'
          }
        ]
      }
    ]
  },

  // 11. Practical Bookkeeping & Pricing
  {
    id: 'course-bookkeeping',
    title: 'Practical Bookkeeping & Pricing for Informal Traders',
    category: 'finance',
    categoryLabel: 'Small Business & Finance',
    description: 'Take control of your business cashflow. Track daily sales, separate business from personal money, calculate markup vs profit margin, manage multi-currency (USD & ZiG), and handle debtor credit safely.',
    durationHours: 10,
    difficulty: 'Beginner',
    storageSizeMb: 5.5,
    isDownloaded: true,
    careerPathway: {
      recommendedJobTitle: 'Small Business Manager / Retail Bookkeeper',
      recommendedGigCategory: 'Digital marketing & tech support',
      potentialIncomeRange: '$250 - $600 / month'
    },
    startupGuide: {
      equipmentNeeded: ['Notebook / Cashbook ledger or Comfort Hub app', 'Calculator', 'Two separate wallet pouches (one for business, one for household)'],
      suggestedPricing: '$20 - $50 monthly to balance books and produce profit statements for small tuckshops',
      firstCustomerStrategy: 'Assist vendors in your local vegetable or hardware market to set up structured daily profit calculations.'
    },
    lessons: [
      {
        id: 'book-lesson-1',
        title: 'The Golden Rule of Separation, Cashbooks & Profit Margin Calculation',
        durationMinutes: 45,
        storageMb: 1.9,
        content: [
          'The Single Biggest Killer of Zimbabwean SMEs: Treating the cash till as your personal pocket money.',
          'Paying Yourself a Salary: Decide a fixed weekly wage; never take money directly from working capital.',
          'Markup vs Margin: Markup = (Profit ÷ Cost) × 100; Margin = (Profit ÷ Selling Price) × 100.',
          'Recording Multi-Currency: Keeping USD and ZiG balances in separate dedicated columns.',
          'Managing Debtors (Chikwereti / Isikwelede): Setting hard credit ceilings and strict payment deadlines.'
        ],
        detailedNotes: {
          overview: 'Over 80% of informal businesses fail within 2 years not due to lack of sales, but because cashflow and profits are consumed by unbudgeted household expenses.',
          corePrinciples: [
            'Capital Integrity: Never touch cost-of-goods money for family groceries; without replacement stock, your business dies.',
            'Daily Balancing: Every evening, count physical cash + EcoCash + Innbucks and reconcile against recorded sales receipts.'
          ],
          safetyProtocols: [
            'Do not extend credit exceeding 10% of your total working capital.',
            'Never lend stock to customers who have not settled previous debts.'
          ],
          troubleshootingTips: [
            'Cash in till is less than recorded sales: Check for unrecorded supplier deliveries or unauthorized personal withdrawals.'
          ],
          zimbabweContext: 'In Bulawayo and Harare, informal traders trade in USD cash, ZiG, and EcoCash. You must track cash in each currency separately to avoid exchange loss.'
        },
        visualDiagram: {
          id: 'diag-book-1',
          title: 'The 3-Bucket SME Cashflow System',
          caption: 'How to separate business revenue into working capital, profit, and personal wage.',
          svgType: 'diagram',
          steps: [
            'Gross Sales Income',
            '-> Bucket 1: 70% Restock Capital (DO NOT TOUCH)',
            '-> Bucket 2: 15% Business Operating Expenses & Rent',
            '-> Bucket 3: 15% Net Profit & Fixed Owner Salary'
          ]
        },
        practicalTip: 'Keep two physical money containers. Container A is for "Restock Capital". Container B is for "Daily Living". Never mix the two.',
        resources: [
          {
            title: 'Daily Cashbook & Debt Ledger Template',
            type: 'cheatsheet',
            description: 'Ready-to-use ledger format with Date, Details, In, Out, Balance, and Currency columns.',
            keyPoints: ['Opening cash balance', 'Daily sales tally', 'Closing verified balance']
          }
        ],
        quiz: [
          {
            id: 'book-q1',
            question: 'What is the most common reason informal small businesses run out of stock and fail in Zimbabwe?',
            options: ['Too many customers', 'Using business restock money to fund personal household expenses without a budget', 'Having a calculator', 'Selling in USD'],
            correctIndex: 1,
            explanation: 'When owners treat gross sales as personal income, they eat into working capital and can no longer afford to re-stock inventory.'
          },
          {
            id: 'book-q2',
            question: 'If you buy an item for $10 and sell it for $15, what is your gross profit in dollars and your profit margin percentage?',
            options: ['Profit $5 and Margin 33.3%', 'Profit $15 and Margin 100%', 'Profit $5 and Margin 50%', 'Profit $10 and Margin 10%'],
            correctIndex: 0,
            explanation: 'Profit = $15 - $10 = $5. Profit Margin = ($5 ÷ $15 selling price) × 100 = 33.3%.'
          },
          {
            id: 'book-q3',
            question: 'How should a business owner ethically and sustainably take income from their enterprise?',
            options: ['Take money from the till whenever they want a snack', 'Pay themselves a predetermined fixed wage/salary on set dates', 'Borrow from friends instead', 'Never take any money forever'],
            correctIndex: 1,
            explanation: 'A fixed owner wage creates a reliable expense in the business budget while protecting working capital.'
          },
          {
            id: 'book-q4',
            question: 'Why must you track USD and ZiG balances in separate columns in your daily cashbook?',
            options: ['Because different currencies cannot be mixed together in calculation without distortion', 'To please the bank', 'Because ZiG is heavier', 'It is not necessary'],
            correctIndex: 0,
            explanation: 'Different currencies have separate purchasing powers and exchange values; combining them into one number creates distorted, false accounts.'
          },
          {
            id: 'book-q5',
            question: 'What is a wise guideline for offering credit (chikwereti / isikwelede) to customers in an informal tuckshop?',
            options: ['Give credit to everyone without limits', 'Set a strict limit (e.g. max 10% of inventory) and do not grant new credit until previous debt is paid in full', 'Never ask for the money back', 'Borrow from loan sharks to give credit'],
            correctIndex: 1,
            explanation: 'Capping credit and requiring full settlement prevents unpaid customer debts from freezing your operating capital.'
          }
        ]
      }
    ]
  }
];

export const INITIAL_JOBS: JobVacancy[] = [
  {
    id: 'job-1',
    title: 'Junior Solar PV Installation Technician',
    companyName: 'Matopos Green Energy Solutions',
    location: 'Kelvin North, Bulawayo',
    city: 'Bulawayo',
    type: 'Full-time',
    industry: 'Renewable Energy & Electrical',
    salaryText: '$320 - $420 / month + field bonus',
    description: 'We are expanding our residential and commercial solar teams in Bulawayo. Seeking a practical, safety-conscious installer familiar with hybrid inverters and battery bank wiring.',
    responsibilities: [
      'Mount solar PV roof brackets and secure solar modules safely.',
      'Assist senior electrician with DC cable conduit runs and inverter mounting.',
      'Wire lithium battery banks and test open circuit voltages.',
      'Adhere to rooftop safety harness protocols.'
    ],
    requirements: [
      'Basic electrical or solar certificate (Comfort Skills Hub or polytechnic).',
      'Comfortable with roof work and outdoor physical tasks.',
      'Resident of Bulawayo with traceable references.'
    ],
    isVerifiedEmployer: true,
    postedDate: '2 hours ago',
    closingDate: 'In 12 days',
    contactMethod: 'In-app application or call 02922 45890',
    syncStatus: 'synced'
  },
  {
    id: 'job-2',
    title: 'Smartphone & Tablet Repair Technician',
    companyName: 'Bulawayo Digital Spares Hub',
    location: '11th Avenue & Fife Street, Bulawayo',
    city: 'Bulawayo',
    type: 'Full-time',
    industry: 'Consumer Electronics & ICT',
    salaryText: '$280 - $400 / month + repair commission',
    description: 'Busy electronics retail and repair center looking for an experienced screen and motherboard repair technician for Android and iOS devices.',
    responsibilities: [
      'Perform screen replacements, charging flex swaps, and speaker replacements.',
      'Diagnose charging port issues using multimeter and bench DC power supply.',
      'Log customer devices accurately and maintain quick 2-hour turnaround.'
    ],
    requirements: [
      'Hands-on experience with hot air rework and microsoldering.',
      'Completion of phone hardware repair course.',
      'Honest, punctual, and good customer communication.'
    ],
    isVerifiedEmployer: true,
    postedDate: 'Yesterday',
    closingDate: 'In 8 days',
    contactMethod: 'In-app application',
    syncStatus: 'synced'
  },
  {
    id: 'job-3',
    title: 'Arc Welder & Steel Fabricator',
    companyName: 'Belmont Structural Steelworks',
    location: 'Belmont Industrial, Bulawayo',
    city: 'Bulawayo',
    type: 'Full-time',
    industry: 'Metalwork & Fabrication',
    salaryText: '$350 - $500 / month',
    description: 'Looking for a skilled arc welder to fabricate sliding perimeter gates, warehouse steel trusses, and window burglar grilles.',
    responsibilities: [
      'Read workshop cut lists and fabricate metal gates to exact millimeter measurements.',
      'Operate 9-inch and 4.5-inch angle grinders and inverter welders.',
      'Clean welds, grind spatter, and apply red-oxide primer.'
    ],
    requirements: [
      'Proficiency in MMA stick welding (E6013 & E7018).',
      'Minimum 1 year hands-on workshop experience.',
      'Strict adherence to PPE and eye protection.'
    ],
    isVerifiedEmployer: true,
    postedDate: '3 days ago',
    closingDate: 'In 14 days',
    contactMethod: 'In-app application',
    syncStatus: 'synced'
  },
  {
    id: 'job-4',
    title: 'Assistant Motor Vehicle Mechanic',
    companyName: 'Mzilikazi Auto Care',
    location: 'Mzilikazi, Bulawayo',
    city: 'Bulawayo',
    type: 'Full-time',
    industry: 'Automotive Repairs',
    salaryText: '$250 - $380 / month',
    description: 'Local auto garage seeking an energetic assistant mechanic for routine vehicle maintenance on Toyota, Nissan, and Honda passenger cars.',
    responsibilities: [
      'Carry out oil and filter changes, brake replacements, and spark plug checks.',
      'Assist senior mechanics with suspension overhauls and gearbox removal.',
      'Keep workshop tools organized and maintain clean work bays.'
    ],
    requirements: [
      'Vocational training in motor vehicle mechanics.',
      'Valid driver’s license is a strong advantage.',
      'Willingness to learn and work under supervision.'
    ],
    isVerifiedEmployer: true,
    postedDate: '4 days ago',
    closingDate: 'In 10 days',
    contactMethod: 'In-app application',
    syncStatus: 'synced'
  }
];

export const INITIAL_GIG_WORKERS: GigWorker[] = [
  {
    id: 'worker-1',
    name: 'Sipho Moyo',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    serviceCategory: 'Plumbing & electrical work',
    suburb: 'Nkulumane 12, Bulawayo',
    city: 'Bulawayo',
    rating: 4.9,
    reviewsCount: 38,
    pricingType: 'Quotation',
    baseRateText: '$15 / visit + quotation',
    isAvailableToday: true,
    isVerified: true,
    completedJobsCount: 84,
    phone: '+263 77 234 5678',
    skills: ['Solar Inverter Setup', 'Geyser Electrical Repair', 'Fault Finding', 'DB Box Rewiring'],
    about: 'Certified vocational electrician with 6 years experience across Bulawayo. I carry digital test meters, spare fuses, and DC breakers in my mobile toolkit.',
    sampleWorkPhotos: []
  },
  {
    id: 'worker-2',
    name: 'Nomalanga Dube',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    serviceCategory: 'Tailoring & fashion design',
    suburb: 'Mpopoma, Bulawayo',
    city: 'Bulawayo',
    rating: 4.8,
    reviewsCount: 52,
    pricingType: 'Fixed',
    baseRateText: '$18 / dress labor',
    isAvailableToday: true,
    isVerified: true,
    completedJobsCount: 120,
    phone: '+263 71 890 1234',
    skills: ['African Print Dresses', 'School Uniforms', 'Curtain Tailoring', 'Zip & Hem Alterations'],
    about: 'Industrial machine seamstress based in Mpopoma. Fast turnaround, quality seams, and precise measurements. I also make bulk school uniforms.',
    sampleWorkPhotos: []
  },
  {
    id: 'worker-3',
    name: 'Blessing Ndlovu',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    serviceCategory: 'Phone & electronics repair',
    suburb: 'Bulawayo CBD (8th Ave)',
    city: 'Bulawayo',
    rating: 4.7,
    reviewsCount: 64,
    pricingType: 'Hourly',
    baseRateText: '$10 / repair labor',
    isAvailableToday: true,
    isVerified: true,
    completedJobsCount: 195,
    phone: '+263 77 912 3456',
    skills: ['Screen Replacement', 'Charging Port Soldering', 'Water Damage Repair', 'Battery Replacement'],
    about: 'Experienced phone hardware technician. I carry high-grade B-7000 glue, replacement test screens, and micro soldering equipment.',
    sampleWorkPhotos: []
  },
  {
    id: 'worker-4',
    name: 'Farai Chidzero',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    serviceCategory: 'Plumbing & electrical work',
    suburb: 'Kelvin West, Bulawayo',
    city: 'Bulawayo',
    rating: 4.9,
    reviewsCount: 41,
    pricingType: 'Quotation',
    baseRateText: '$25 / day or project quotation',
    isAvailableToday: true,
    isVerified: true,
    completedJobsCount: 72,
    phone: '+263 77 567 8901',
    skills: ['Arc Welding', 'Sliding Gates', 'Burglar Bars', 'Steel Trusses'],
    about: 'Licensed welder and steel artisan. Specializing in security burglar grilles, sliding gates, and structural steel maintenance.',
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
    description: 'Samsung A12 Screen replacement + tempered glass installation',
    date: '2026-10-14',
    paymentMethod: 'cash',
    customerOrSupplier: 'Mr. Khumalo',
    syncStatus: 'synced'
  },
  {
    id: 'tx-2',
    type: 'expense',
    amount: 18.0,
    currency: 'USD',
    category: 'Spare Parts',
    description: 'Bought Samsung A12 replacement display from Kelvin wholesale',
    date: '2026-10-14',
    paymentMethod: 'cash',
    customerOrSupplier: 'Digital Spares Ltd',
    syncStatus: 'synced'
  },
  {
    id: 'tx-3',
    type: 'gig_payment',
    amount: 45.0,
    currency: 'USD',
    category: 'Electrical Gig',
    description: 'Rewired tripping kitchen geyser switch & replaced 20A breaker',
    date: '2026-10-13',
    paymentMethod: 'ecocash',
    customerOrSupplier: 'Mrs. Sibanda',
    syncStatus: 'synced'
  }
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    name: 'Universal Smartphone Screen Adhesive (B-7000 50ml)',
    category: 'Spares & Consumables',
    quantity: 6,
    unitCost: 2.5,
    sellingPrice: 5.0,
    currency: 'USD',
    lowStockAlert: 2,
    lastUpdated: '2026-10-14'
  },
  {
    id: 'inv-2',
    name: 'Type-C Charging Sub-board (Samsung/Redmi)',
    category: 'Spares & Consumables',
    quantity: 4,
    unitCost: 3.0,
    sellingPrice: 8.0,
    currency: 'USD',
    lowStockAlert: 2,
    lastUpdated: '2026-10-14'
  },
  {
    id: 'inv-3',
    name: 'Solar DC 16A Circuit Breaker (2-Pole)',
    category: 'Solar Equipment',
    quantity: 3,
    unitCost: 5.0,
    sellingPrice: 10.0,
    currency: 'USD',
    lowStockAlert: 2,
    lastUpdated: '2026-10-13'
  }
];

export const INITIAL_CUSTOMER_CREDITS: CustomerCredit[] = [
  {
    id: 'cred-1',
    customerName: 'Tendai Marufu',
    phone: '+263 77 412 9081',
    amountOwed: 15.0,
    currency: 'USD',
    lastPurchaseDate: '2026-10-12',
    notes: 'Promised to pay balance upon month-end pay date (25th)'
  }
];

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'guest',
  fullName: '',
  phone: '',
  email: '',
  suburb: '',
  city: 'Bulawayo',
  headline: '',
  bio: '',
  education: '',
  workExperience: '',
  skills: [],
  references: '',
  roles: ['learner'],
  isWorkerProfileActive: false
};
