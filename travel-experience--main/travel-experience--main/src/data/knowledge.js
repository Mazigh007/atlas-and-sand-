'use strict';
/**
 * Travel-assistant knowledge base.
 * Used two ways: (1) injected as ground truth into the LLM system prompt, and
 * (2) matched by keyword score by the offline fallback expert when no API key
 * is configured — so the widget never goes silent.
 */
const intents = [
  {
    id: 'luxury_price',
    label: 'What does a luxury tour cost?',
    keywords: ['luxury', 'price', 'cost', 'how much', 'budget', 'expensive', 'quote'],
    answer:
      'Our luxury journeys start from **$6,000 per person for 7 days**, excluding international flights. That covers palace and riad suites, a staffed desert camp (3 staff per guest), private vehicle, guide and driver, all entrance fees and every meal except lunch, plus any domestic flight we use to save you a day.\n\nThe 10-night Grand Moroccan runs from $8,900 pp. Private-jet or helicopter legs are quoted at cost, separately.',
    links: [{ label: 'Luxury tours', href: '/tours/luxury' }, { label: 'Get a luxury quote', href: '/book' }],
  },
  {
    id: 'group_price',
    label: 'Group tour prices',
    keywords: ['group', 'price', 'cost', 'students', 'women', 'senior', 'per person', 'band', '$2,000', '2000', '4000'],
    answer:
      'Group tours are **$2,000 – $4,000 per person**, and the size of the party sets the price: 10 travellers pays the top of the band, 30 travellers pays the floor.\n\nExamples for published departures:\n· Student Discovery, 10 nights — $3,400 pp at 10 travellers, $2,000 pp at 30\n· Women-only Atlas & Coast, 7 nights — $4,000 pp at 10, $2,800 pp at 30\n· Senior Slow Travel, 8 nights — $3,400 pp at 10, $2,600 pp at 30\n\nWe never run below 10 travellers, and never above 30.',
    links: [{ label: 'All group departures', href: '/tours/group' }, { label: 'Price your group', href: '/book' }],
  },
  {
    id: 'group_size',
    label: 'How big are the groups?',
    keywords: ['how big', 'group size', 'people', 'minimum', 'maximum', '10', '30', 'party'],
    answer:
      'Between **10 and 30 travellers**, plus trip leaders. Senior departures are usually capped at 20 and women-only retreats at 24, because those are the sizes where dinner still works and nobody waits.\n\nIf a published departure has not reached 10 travellers by 75 days before departure, we offer a private version, another date, or a full refund including the deposit.',
    links: [{ label: 'Group tours', href: '/tours/group' }],
  },
  {
    id: 'private_vs_group',
    label: 'Private or group?',
    keywords: ['private', 'group', 'difference', 'which', 'better', 'compare'],
    answer:
      'Short version: private buys you the right to change your mind at 9 a.m.; a group buys company, two guides and a much better price.\n\n**Private** — from $2,400 pp, any date, your own guide and 4×4. A 20-person group on the identical route is around $2,400 pp; doing it privately is $3,400–$4,200 pp. Same riads, twin rooms.\n\n**Group** — fixed dates, 10–30 travellers, from $2,000 to $4,000 pp, women-only / student / senior options, and a 1:10 leader ratio.',
    links: [{ label: 'Private tours', href: '/tours/private' }, { label: 'Group tours', href: '/tours/group' }],
  },
  {
    id: 'deposit',
    label: 'How much deposit?',
    keywords: ['deposit', 'pay', 'payment', 'stripe', 'card', 'balance', 'instalment', 'installment', 'invoice', 'refund of deposit'],
    answer:
      'A **25% deposit** secures the trip — $1,500 on a $6,000 pp luxury journey for two, for example. The balance falls due **60 days before departure**. Booking later than that means paying in full, and we need 21 days to confirm rooms and guides.\n\nCard payments run through Stripe; the number goes to Stripe and never to us. Deposits are non-refundable, but not lost if we cancel. Group leaders can pay one deposit for the party, or send everyone their own link.',
    links: [{ label: 'Booking conditions', href: '/booking-conditions' }, { label: 'Start a booking', href: '/book' }],
  },
  {
    id: 'cancellation',
    label: 'Cancellation policy',
    keywords: ['cancel', 'cancellation', 'refund', 'change my mind', 'postpone', 'reschedule', 'policy'],
    answer:
      'Cancellation charges run on the **total trip cost**, from the day we receive your written notice:\n\n· More than 90 days out — deposit only (25%)\n· 90–60 days — 50%\n· 59–30 days — 75%\n· 29–15 days — 90%\n· Under 15 days or no-show — 100%\n\nAmendments cost $75 pp plus any supplier charge, free of our fee before the balance date. Insurance normally reimburses these charges; we send whatever paperwork they ask for, at no cost. Group departures use a 120/90/59-day scale instead.',
    links: [{ label: 'Full booking conditions', href: '/booking-conditions' }],
  },
  {
    id: 'women_only',
    label: 'Women-only journeys',
    keywords: ['women', 'woman', 'female', 'ladies', 'girls', 'solo female', 'safar for women'],
    answer:
      'We run **women-only group departures of 10–30 travellers**, with a female guide, female driver and female cooks on the itinerary, riads booked as a whole house, and hammams emptied for the group. Two shapes: **Atlas & Coast, 7 nights** (Marrakech, argan country, Essaouira, Chefchaouen) and **Wellness in the Rif, 5 nights** around Chefchaouen and the Khamis hot springs.\n\nPriced $2,000–$4,000 pp by group size. Open to all women and non-binary travellers; we do not charge solo women a single supplement.',
    links: [{ label: 'Women-only departures', href: '/tours/group/women' }, { label: 'The honest briefing', href: '/journal/women-travelling-in-morocco' }],
  },
  {
    id: 'students',
    label: 'Student groups',
    keywords: ['student', 'university', 'school', 'group leader', 'teacher', 'gap year', 'youth', 'educational'],
    answer:
      'Student groups are **10–30 travellers, 9–10 nights, $2,000–$3,400 pp** — our lowest band. The Student Discovery itinerary includes two nights with a family in the Aït Bouguemez valley, a service day with an Atlas school, craft workshops in Fes and a desert bivouac.\n\nFor institutions: risk-assessment and safeguarding documents in your format, 1:10 leader ratio, PO-numbered invoices, three-stage payment, and a named welfare contact at home.',
    links: [{ label: 'Student journeys', href: '/tours/group/students' }],
  },
  {
    id: 'seniors',
    label: 'Senior travel',
    keywords: ['senior', 'older', 'retired', 'retirement', 'mobility', 'wheelchair', 'accessib', 'slow'],
    answer:
      'Our senior departures are for travellers **55 and above**, 10–20 people, 8 nights, $2,600–$3,400 pp. Three beds in eight nights, no 5 a.m. repacks, walking graded 1–2 of 5 with the vehicle within 200 m of every stop, rooms with a lift or ground-floor access confirmed in writing before you book, and a nurse-trained leader with a physician contact in each city.',
    links: [{ label: 'Senior journeys', href: '/tours/group/seniors' }, { label: 'Accessibility', href: '/contact' }],
  },
  {
    id: 'best_time',
    label: 'Best time to visit',
    keywords: ['when', 'best time', 'weather', 'season', 'temperature', 'rain', 'snow', 'heat', 'ramadan'],
    answer:
      'March to early June and late September to November are the sweet spots: warm south, cool mountains, everything open. July–August is 40°C+ inland — good with a pool and a late start, poor in the dunes. December–February is lovely in the desert, cold at night, and Marrakech can be 8°C at dawn.\n\nRamadan shifts each year and changes the rhythm completely: wonderful evenings, many kitchens closed by day. We will tell you exactly what that means for your dates.',
    links: [{ label: 'Destinations & seasons', href: '/destinations' }],
  },
  {
    id: 'duration',
    label: 'How many days do I need?',
    keywords: ['how long', 'days', 'nights', 'duration', 'week', '10 days', 'two weeks'],
    answer:
      'Seven days is the minimum that does the country justice: Marrakech plus one long transfer to the desert edge or the Atlas, two bases, one day with nothing in it. Ten nights adds Fes and the north, or a desert loop with the gorges. Anything under five nights is a taster and we would rather tell you that than sell it.',
    links: [{ label: 'See the journeys', href: '/journeys' }],
  },
  {
    id: 'itinerary_build',
    label: 'Can you design something for me?',
    keywords: ['custom', 'bespoke', 'design', 'plan', 'itinerary', 'suggest', 'ideas', 'tailor'],
    answer:
      'Yes — that is most of what we do. Tell me who is coming, roughly when, and what you want to come home with; a designer sends a full day-by-day with real prices, usually within 24–48 hours, and there is no planning fee and no obligation.\n\nThe fastest route is the enquiry form, which calculates your 25% deposit as you type, or send us a WhatsApp and we will call you back.',
    links: [{ label: 'Plan my trip', href: '/book' }, { label: 'Bespoke tours', href: '/tours/bespoke' }],
  },
  {
    id: 'safety',
    label: 'Is Morocco safe?',
    keywords: ['safe', 'safety', 'dangerous', 'security', 'harassment', 'scam', 'solo'],
    answer:
      'Morocco is politically stable, violent crime against travellers is rare, and the police and tourist offices are genuinely helpful. The real risks are ordinary: sun and dehydration, road travel (take our drivers, not rental cars at night), persistent shopkeepers, and pickpockets in the square at night.\n\nPractical: keep a copy of your passport separately, refuse nothing twice — say “la, shukran” once and keep walking, and let us arrange the late transfers so you are never hunting a taxi at 4 a.m.',
    links: [{ label: 'Why us / how we work', href: '/why-us' }],
  },
  {
    id: 'flights_visa',
    label: 'Flights, visas and documents',
    keywords: ['visa', 'flight', 'passport', 'airport', 'arrive', 'entry', 'document'],
    answer:
      'Visa-free for UK, US, EU, Canada, Australia, Japan and roughly 65 other nationalities for stays up to 90 days; passport valid six months beyond your return. Since 2025 there is a digital arrival form — we send the link a week before you fly.\n\nWe book international flights as your agent at the published fare plus $40 pp ticketing, no markup, and hold seats for 48 hours. Most guests arrive in Marrakech (RAK) or Casablanca (CMN).',
    links: [{ label: 'FAQ', href: '/faq' }, { label: 'Contact', href: '/contact' }],
  },
  {
    id: 'insurance',
    label: 'Do I need insurance?',
    keywords: ['insurance', 'medical', 'cover', 'cancellation cover'],
    answer:
      'Yes — travel insurance with medical, repatriation and cancellation cover is a condition of booking. We ask for the insurer and policy number with the balance invoice. It is what pays your cancellation charge if you break a leg in March, and what covers evacuation from the Atlas if the weather closes in.',
    links: [{ label: 'Booking conditions', href: '/booking-conditions' }],
  },
  {
    id: 'food',
    label: 'The food',
    keywords: ['food', 'eat', 'restaurant', 'tagine', 'vegetarian', 'allergic', 'diet', 'cuisine', 'cooking'],
    answer:
      'Seven tagines is a mistake; the food is much wider than that. Expect pastilla in Fes (sweet-savoury pigeon or chicken in warqa), tangia slow-cooked overnight in the hammam embers, mechoui in Marrakech, sardines and fried fish on the Atlantic, olive-oil bread-and-thyme breakfasts in the Rif, and the best vegetable cooking in North Africa because a great deal of Morocco is vegetarian by default.\n\nAllergies and diets: declare them at booking and every kitchen and guide is briefed. Vegetarian and vegan journeys are a specialty of ours, not an afterthought.',
    links: [{ label: 'Bespoke culinary journey', href: '/journeys/bespoke-culinary-morocco' }],
  },
  {
    id: 'desert',
    label: 'The Sahara / desert',
    keywords: ['desert', 'sahara', 'dunes', 'merzouga', 'camp', 'camel', 'erg', 'stargaz'],
    answer:
      'Two deserts: the Erg Chebbi dunes at Merzouga (150 m tall, 90 minutes beyond Rissani — the real one) and the Agafay stone desert 45 minutes from Marrakech (no sand, but perfect for one night without a nine-hour drive).\n\nOur luxury camp is fully staffed, en-suite, moved to a new site for you between nights, with a chef, an astronomer and a 12-inch telescope. Camel caravan at golden hour, and silence on the way in — our guides walk it without talking.',
    links: [{ label: 'Luxury Sahara, 7 nights', href: '/journeys/luxury-sahara-under-the-stars' }],
  },
  {
    id: 'contact_human',
    label: 'Talk to a human',
    keywords: ['human', 'agent', 'call', 'phone', 'whatsapp', 'speak', 'person', 'email', 'email me'],
    answer:
      'Happy to get you to a person — a designer, not a call centre.\n\n· **Marrakech team:** +212 677 926 928\n· **USA line (also WhatsApp):** +1 623 282 1221\n· **WhatsApp (fastest):** +212 677 926 928\n· **E-mail:** bookings@moroccanexperience.com\n\nMarrakech hours are Mon–Sat 08:30–19:30; the in-country duty line runs 24/7 for anyone already travelling with us.',
    links: [{ label: 'Contact page', href: '/contact' }],
  },
  {
    id: 'payment_security',
    label: 'Is it safe to pay by card?',
    keywords: ['secure', 'security of payment', 'card details', 'data', 'trust', 'fraud'],
    answer:
      'Your card number, expiry and CVV go straight to Stripe over an encrypted connection — they never touch our servers, and we keep only an amount, a date and a payment reference.\n\nNobody at Moroccan Experience will ever ask you for a CVV or an SMS code, by any channel. If someone claims to be us and does, hang up and call the number printed on this website.',
    links: [{ label: 'Privacy policy', href: '/privacy-policy' }],
  },
  {
    id: 'booking_problem',
    label: 'Problem with my booking or payment',
    keywords: ['charged twice', 'declined', 'failed', 'confirmation number', 'booking reference', 'did not receive', 'invoice'],
    answer:
      'Send your reference (it looks like ME-2026-00042) and we will find it. If a card payment was declined you have not been charged; if you were charged twice, we will refund the duplicate within 5–10 working days once Stripe confirms it.\n\nNo e-mail? Check spam for “moroccanexperience.com”, then WhatsApp the Marrakech number with your reference and we will re-send it within the hour.',
    links: [{ label: 'View my confirmation', href: '/booking/lookup' }, { label: 'Contact', href: '/contact' }],
  },
  {
    id: 'greeting',
    label: 'Hello',
    keywords: ['hi', 'hello', 'salam', 'bonjour', 'hola', 'hey', 'good morning'],
    answer:
      'Salam — good to see you here. I am the Moroccan Experience travel assistant: I can quote a journey, explain the deposit and cancellation terms, compare private with group travel, or tell you honestly whether eight days in July is a mistake.\n\nWhat are you picturing?',
    quick: ['Price a luxury tour', 'Group tours for women', 'Best time to go'],
  },
  {
    id: 'thanks',
    label: 'Thanks',
    keywords: ['thanks', 'thank you', 'shukran', 'cheers', 'great'],
    answer: 'Bismillah — happy to help. If you want a designer to look at dates and prices properly, the enquiry form takes about two minutes and no money moves until you have a proposal you like.',
    links: [{ label: 'Plan my trip', href: '/book' }],
  },
  {
    id: 'tailor_group',
    label: 'Private group of friends',
    keywords: ['friends', 'family group', 'club', 'association', 'charity', 'company', 'incentive', 'wedding'],
    answer:
      'Taking our group itinerary privately for your own 10–30 people is the best value thing we do: you choose the date, we price the whole party. It usually lands between $2,400 and $4,000 pp — the same band as a shared departure — and you get the vehicle, the guide and the riad to yourselves.\n\nWeddings, club weekends and company incentives we design from scratch, including permits and a local team.',
    links: [{ label: 'Group tours', href: '/tours/group' }, { label: 'Bespoke', href: '/tours/bespoke' }],
  },
  {
    id: 'physical_pace',
    label: 'Fitness and walking',
    keywords: ['fitness', 'walking', 'hike', 'trek', 'toubkal', 'stamina', 'difficulty', 'active'],
    answer:
      'Every journey has a pace label, and nothing we sell requires technical ability. The mildest weeks involve 1–3 km of gentle walking a day; the Atlas and Rif walks run 3–5 hours at moderate effort on mule tracks; Toubkal (4,167 m) is the only real mountain on our list and needs two days with a refuge, crampons in winter, and a good month of health.\n\nIf you want a trekking journey we will set the daily altitude gain to whoever in the party is slowest.',
    links: [{ label: 'Marrakech & the Atlas foothills', href: '/journeys/marrakech-and-the-atlas-foothills' }],
  },
  {
    id: 'sustainable',
    label: 'Local impact and ethics',
    keywords: ['sustainab', 'ethical', 'local', 'community', 'environment', 'responsible', 'tips'],
    answer:
      'We are Morocco-based and pay Moroccan wages: guides and drivers are salaried in the off-season, not freelance and hungry. Sixty per cent of our properties are family-run riads and cooperative lodges we have used for years, camps use solar and pack out everything, and we do not sell visits to schools or orphanages, or photographs of children, at any price.\n\nTips are suggested in writing on your arrival card so you never have to negotiate them.',
    links: [{ label: 'About us', href: '/about' }, { label: 'Why us', href: '/why-us' }],
  },
];

const DEFAULT_ANSWER =
  'I can help with itineraries, prices, the 25% deposit, cancellation terms, group sizes (10–30 travellers), women-only, student and senior departures, and the practical things — visas, heat, hammams, guides.\n\nLuxury journeys start from $6,000 per person for 7 days; group journeys run $2,000–$4,000 pp depending on how many of you there are. What are you thinking of, and roughly when?';

module.exports = { intents, DEFAULT_ANSWER };
