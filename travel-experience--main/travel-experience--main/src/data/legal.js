'use strict';
/**
 * Legal + policy content. Rendered on /booking-conditions, /privacy-policy,
 * /legal-terms and /faq, and summarised for the booking form and chat agent.
 * Placeholder company details live in src/config.js — replace before going live.
 */

const COMMERCIAL = {
  depositPercent: 25,
  depositNonRefundable: true,
  balanceDueDaysBefore: 60,
  minLeadDays: 21,
  amendmentFeePerPerson: 75,
  nonRefundableWindowDays: 30,
  cancellationScale: [
    { window: 'More than 90 days before departure', charge: 'Deposit only (25% of trip cost)' },
    { window: '90 – 60 days before departure', charge: '50% of trip cost' },
    { window: '59 – 30 days before departure', charge: '75% of trip cost' },
    { window: '29 – 15 days before departure', charge: '90% of trip cost' },
    { window: '14 days or less, or no-show', charge: '100% of trip cost' },
  ],
  groupScale: [
    { window: 'More than 120 days before departure', charge: 'Deposit only (25% of group total)' },
    { window: '120 – 90 days', charge: '50% of group total' },
    { window: '89 – 60 days', charge: '75% of group total' },
    { window: '59 days or less', charge: '100% of group total' },
  ],
  insuranceNote:
    'Travel and cancellation insurance is a condition of booking. We ask for your insurer and policy number at the time of the balance invoice and will not confirm seats without it.',
};

const bookingConditions = {
  updated: '1 September 2026',
  intro: [
    'These Booking Conditions apply to every journey sold by Moroccan Experience voyages SARL (“we”, “us”) and form part of the contract between you and us. By paying a deposit through our website, by card via Stripe or by bank transfer, you accept them in full. If anything here is unclear, ask before you pay — we would much rather explain it than argue about it later.',
  ],
  sections: [
    {
      h: '1. Booking and your 25% deposit',
      p: [
        'A booking is created when we receive your signed booking form and the deposit, and we respond with a written confirmation. Your confirmation number (ME-YYYY-NNNNN) is the reference for every payment, invoice and e-mail that follows.',
        'The deposit is 25% of the total trip cost for private, luxury and bespoke journeys. On group departures it is 25% of the group total, and it may be paid either as a single payment by the group leader or as individual card payments by each traveller through the same secure link — the outcome is identical.',
        'Deposits are non-refundable and non-transferable between journeys, and are applied to your final invoice. Deposits are not lost if we cancel: see section 8.',
        'The balance falls due 60 days before departure. If you book within 60 days of travel, the full amount is due at booking, and we need 21 days’ notice to be able to confirm hotels and guides. Inside 21 days we will still try — call us.',
      ],
    },
    {
      h: '2. Prices and what they include',
      p: [
        'Prices are quoted per person, in US dollars, sharing a twin or double room, and exclude international flights unless expressly stated. Published “from” prices are based on the shoulder season and on the minimum group or party size shown with each journey.',
        'Our price bands: luxury tours from $6,000 per person for seven days; group tours from $2,000 to $4,000 per person, 10 to 30 travellers; private tours from $2,400 per person; bespoke journeys quoted line by line.',
        'Room use, guide availability, vehicle type and domestic airfares are all priced at the time of quotation. We hold prices for 21 days. After that, if the hotels we are holding for you move, we will tell you before you pay anything further.',
        'A single-room supplement applies where you do not wish to share; on published group departures we do not charge it to solo travellers who are happy to be paired.',
      ],
      list: [
        'Included on every journey: accommodation as listed, breakfast daily, all transfers and transport stated, licensed local guides and drivers, entrance fees named in the itinerary, and our 24/7 in-country duty line.',
        'Not included: international flights, lunch and dinner unless listed, drinks, visas, tips, travel insurance, and anything described as optional.',
      ],
    },
    {
      h: '3. Payments, cards and Stripe',
      p: [
        'Online payments are taken by Stripe Payments Europe Ltd through our website, over an encrypted connection. We never see or store your card number, expiry date or CVV: those are handled by Stripe, and we keep only a payment reference and the amount.',
        'We accept Visa, Mastercard, American Express and, in Morocco and the EU, bank transfer in MAD or EUR. Transfers must reach us by the due date; the date of receipt, not the date of your instruction, is what counts.',
        'A surcharge of 0% applies to card payments. Currency conversion outside the US is done by your card issuer; check their rate before paying a large balance.',
        'If a payment fails or is declined, we will contact you within one business day. Rooms we hold for you are released after seven days of an unpaid invoice, and the itinerary may need re-quoting.',
      ],
    },
    {
      h: '4. Changes you make',
      p: [
        'Changes before the balance due date: an amendment fee of $75 per person applies, plus any charge the supplier makes. Where we recover money from a supplier for something you no longer use, we pass it back to you minus our time.',
        'Inside 30 days of departure we cannot usually change anything that touches an already-confirmed hotel, guide or internal flight — the supplier’s own cancellation charge applies in full and is stated to you before we act.',
        'Name changes on group departures are free up to 30 days before departure (passport name must match the ticket by then). Inside 30 days, a $50 admin charge and any airline fee apply.',
      ],
    },
    {
      h: '5. Cancellation by you',
      p: [
        'Tell us in writing on the day you decide. Cancellation charges run from the date we receive your written notice, and are calculated on the total trip cost, not the balance outstanding. That is why cancelling the day after the balance falls due is no cheaper than cancelling on day 200 — the deposit already covers the first band.',
        'Travel insurance normally reimburses these charges where the reason for cancelling is covered. Send the insurer your cancellation invoice the same week you receive it; we will provide whatever documentation they ask for, free of charge.',
      ],
      table: { head: ['When you cancel', 'What you pay'], rows: COMMERCIAL.cancellationScale },
      p2: [
        'Unused elements of a journey that you voluntarily skip — a hike you sit out, a riad night you leave early — cannot be refunded, because they are already committed to the property. Bad weather that closes a road or grounds a balloon is handled differently: we substitute, and refund only where no substitute exists.',
      ],
    },
    {
      h: '6. Group departures: minimum numbers and what we promise',
      p: [
        'Group journeys need a minimum of 10 travellers. If a published departure does not reach 10 by 75 days before departure we will offer you: the same journey at the higher per-person price for the smaller group, an alternative date, a private version of the itinerary, or a full refund of everything paid including the deposit. You will hear from us by then, not later.',
        'Maximum group size is 30 travellers plus trip leaders. Most senior departures are capped at 20; most women-only retreats at 24.',
        'The per-person price of a group journey is set by final group size. Where a group shrinks after booking but the departure still runs, the price does not rise — we absorb it. Where a group grows, you get a better rate than you booked and we refund the difference on the balance invoice.',
      ],
    },
    {
      h: '7. Travel documents, health and conduct',
      p: [
        'You are responsible for passport validity (six months beyond your return date), visas, and any entry requirements for the countries you transit. We will tell you what applies to Morocco as at the date of booking; rules change and we advise you to re-check 30 days out.',
        'Declare medical conditions, mobility needs, dietary requirements and allergies at booking, so we can place you in a room you can use and brief your guide. Where a condition could affect the trip, we may ask for a doctor’s note — this is for you, not for our file.',
        'Morocco is a Muslim-majority country with strong norms of discretion. Photography of people requires asking first; on our journeys we do not photograph anyone without consent, and we ask you to follow the same rule. Public drunkenness, drug use and disrespect towards religious sites can result in removal from a journey without refund.',
      ],
    },
    {
      h: '8. Changes and cancellation by us',
      p: [
        'If we cancel for any reason other than your conduct or an extraordinary circumstance, you receive a full refund of all monies paid within 14 days, plus the option of an alternative journey at the best rate we can hold.',
        'We may have to change hotels, routes, guides or vehicles. If we make a material change (a lower-category property, a lost night, a substitute guide of a different language) we tell you as soon as we know and credit the difference in value to your account.',
        'Extraordinary circumstances — sandstorms, flooding, strikes, border closures, war, epidemics, airline failures, government advice — are outside our control. In those cases we will do everything reasonable to rearrange and recover value for you, and we will keep you informed and safe. Costs arising purely from such events (extra nights, re-routed flights) are for your account and are normally recoverable from your insurer.',
        'If FCDO, US State Department or the Moroccan authorities issue advice against travel to a region on your itinerary while you are there, we relocate the party at our cost and refund unspent elements.',
      ],
    },
    {
      h: '9. Financial protection and how your money sits',
      p: [
        'Payments taken on this website are for the trip you have booked. Suppliers are paid on schedule from the trip account; your funds are not mixed with operating cash, and our accounts are audited annually.',
        'We are licensed as a travel agency by the Moroccan Ministry of Tourism (see the footer for the licence number on all correspondence) and hold professional indemnity and fidelity cover.',
        'If you pay by credit card in the US, UK or EU, section 75 / chargeback protections with your issuer may apply in addition to these conditions.',
      ],
    },
    {
      h: '10. Complaints',
      p: [
        'Raise it while you are travelling: that is when we can actually fix it. The 24/7 duty line is on your arrival card and in the WhatsApp thread, and a senior designer answers within 30 minutes at any hour.',
        'Written complaints after you return are acknowledged in two business days and answered substantively in 14. If we have not resolved it, you may escalate to our insurer and, for Morocco-resident contracts, to the Federation of Tourism Enterprises (FNEET) mediation service.',
      ],
    },
  ],
};

const privacyPolicy = {
  updated: '1 September 2026',
  controller: 'Moroccan Experience voyages SARL, 47 Derb Sidi Bouloucate, Marrakech 40000, Morocco · privacy@moroccanexperience.com',
  intro: [
    'We collect as little as we can get away with, we use it only for the reasons set out below, and we do not sell it. This policy explains what we hold, why, for how long, who else sees it and what you can ask us to do about it. It is written to comply with the EU/EEA GDPR, the UK GDPR and Data Protection Act 2018, and Morocco’s Law 09-08 on the protection of natural persons with regard to the processing of personal data, as implemented by the CNDP.',
  ],
  sections: [
    {
      h: '1. What we collect',
      list: [
        'Booking data: name, e-mail, telephone, date of birth, nationality, passport number and expiry (only when we issue flights or need a permit), billing address, and payment records.',
        'Travel-need data, where you volunteer it: medical conditions, mobility, dietary requirements and allergies — collected so we can place you in a usable room and brief a guide. This is special-category data and we treat it as such.',
        'Correspondence: enquiries, itinerary notes, chat transcripts with our travel assistant, WhatsApp and e-mail threads, and call recordings where you consent.',
        'Technical data: IP address, device and browser type, pages viewed, referring page, approximate country, and the booking reference you came from.',
        'Marketing data: your newsletter subscription and your preferences about what we send you.',
      ],
    },
    {
      h: '2. Why we use it, and the lawful basis',
      table: {
        head: ['Purpose', 'Lawful basis', 'Retention'],
        rows: [
          ['Respond to an enquiry and prepare a quotation', 'Legitimate interest / pre-contractual steps', '24 months from last contact'],
          ['Perform your contract, confirm suppliers, travel documents', 'Performance of a contract', '7 years after travel (accounting and litigation)'],
          ['Take payment', 'Performance of a contract; legal obligation (AML, tax)', 'Stripe retains the card record; we keep only the amount, date and reference for 7 years'],
          ['Safety, medical or border requests while you travel', 'Vital interests; legal obligation', 'Duration of the trip, then as above'],
          ['Newsletter and journey inspiration', 'Consent (UK/EU) or legitimate interest (existing customers)', 'Until you unsubscribe; we delete after 24 months of silence'],
          ['Improve our site and measure campaign performance', 'Consent for non-essential cookies; legitimate interest for aggregated statistics', '14 months for analytics'],
          ['Prevent fraud, abuse and chargeback disputes', 'Legitimate interest', '24 months'],
        ],
      },
    },
    {
      h: '3. Payment data and Stripe',
      p: [
        'Card payments on this site are processed by Stripe. When you pay your 25% deposit or your balance, the card number, expiry date and security code go directly to Stripe’s systems and never touch our servers. We receive the customer name, the last four digits, the brand, the amount, the result, and a Stripe charge or session identifier.',
        'Stripe acts as an independent controller for its own fraud-prevention and regulatory purposes and may transfer data outside your country of residence under Standard Contractual Clauses. You can read their terms and privacy statement at stripe.com.',
        'We do not store card data on our own systems, and we will never ask for a card number by e-mail, WhatsApp or in chat. Our staff will never ask for your CVV or a one-time passcode. If someone claims to be us and does, do not send it — call the number on this website.',
      ],
    },
    {
      h: '4. Sharing, and only with whom',
      list: [
        'Suppliers who deliver your trip: riads, hotels, guides, drivers, domestic airlines, camp operators and permit offices. We send them the minimum needed for your stay, and their own privacy notices apply.',
        'Payment and IT processors: Stripe (payments), our e-mail and CRM platforms, and our hosting provider.',
        'Our travel-insurance partner and broker, where you buy cover through us.',
        'Authorities, where the law requires it — border and police registration in Morocco for foreign visitors’ accommodation is a legal requirement handled by your property.',
        'We do not sell personal data, we do not rent lists, and we do not share it with advertisers for cross-context behavioural advertising.',
      ],
    },
    {
      h: '5. Transfers outside Morocco and the EEA',
      p: [
        'Our main systems sit in the EU (hosting, e-mail, CRM). Stripe and some suppliers process in the United States. Where data leaves Morocco or the EEA we rely on adequacy, Standard Contractual Clauses approved by the European Commission, and — for transfers into Morocco — the protections of Law 09-08 with CNDP notification. Copies of the safeguards are available from our privacy contact on request.',
      ],
    },
    {
      h: '6. Cookies and similar technology',
      p: [
        'We use four kinds of cookie, and you can change your choice at any time from the banner or the “Cookie settings” link in the footer.',
      ],
      table: {
        head: ['Name', 'Type', 'What it does', 'Lasts'],
        rows: [
          ['mx_session', 'Strictly necessary', 'Keeps your booking form and chat conversation together', 'Session'],
          ['mx_cookie_consent', 'Strictly necessary', 'Remembers your cookie choice so we do not ask again', '12 months'],
          ['mx_booking_draft', 'Strictly necessary', 'Saves your itinerary draft in your browser so a refresh does not lose it', '7 days'],
          ['mx_analytics_*', 'Analytics (consent)', 'Counts page views and journeys viewed, aggregated, no fingerprinting', '14 months'],
          ['stripe_checkout / m.stripe.com', 'Third party, necessary on payment pages', 'Fraud detection and card form security for the checkout', 'Up to 24 months'],
        ],
      },
    },
    {
      h: '7. How we keep it safe',
      p: [
        'Encryption in transit (TLS 1.2+), encrypted at rest for the booking database, least-privilege accounts with mandatory two-factor authentication, access logging, annual penetration testing, and staff training on safeguarding and on photographing people. Passport scans are deleted from e-mail and inbox folders as soon as they are filed in the booking record.',
        'If a breach is likely to risk your rights and freedoms we will tell the supervisory authority within 72 hours and tell you without undue delay.',
      ],
    },
    {
      h: '8. Your rights',
      list: [
        'Access a copy of what we hold about you, free of charge.',
        'Rectification — most travellers update this themselves by replying to the confirmation e-mail.',
        'Erasure, where we have no legal reason to keep it (we must keep invoices for 7 years).',
        'Restriction and objection, including objecting to direct marketing at any time, one click, no questions.',
        'Portability of the data you gave us by e-mail.',
        'Withdraw consent for analytics or marketing cookies without affecting what you have already booked.',
        'Lodge a complaint with a supervisory authority: in the EEA/UK with your local authority; in Morocco with the CNDP (Direction de la Protection des Citoyens, 70 Rue de Fès, Rabat, cndp.ma).',
      ],
      p: [
        'To exercise a right, write to privacy@moroccanexperience.com. We respond within one month, and we may need to verify who you are before we do.',
      ],
    },
    {
      h: '9. Children',
      p: [
        'Journeys with travellers under 18 are booked by the accompanying adult or the school, and a child’s personal data is only shared with the leaders who need it. We do not market to children and do not knowingly collect data from anyone under 16 outside a booked group. Student groups aged 17 – 30 are booked by the institution, and the university or school is the controller for its own register.',
      ],
    },
    {
      h: '10. This policy and how long it has said this',
      p: [
        'Material changes are posted here with a new “last updated” date and, where your contract is affected, e-mailed to travellers with a live booking. Previous versions are available on request.',
      ],
    },
  ],
};

const legalTerms = {
  updated: '1 September 2026',
  intro: [
    'These terms govern your use of moroccanexperience.com (the “Site”) and the contract of sale between you and Moroccan Experience voyages SARL. Read them alongside the Booking Conditions, which set out the money, cancellation and change rules for the journey itself.',
  ],
  sections: [
    {
      h: '1. Who we are',
      p: [
        'Moroccan Experience voyages SARL, a Moroccan limited liability company, registered in Marrakech, licensed by the Moroccan Ministry of Tourism as a travel agency (licence number in the footer and on all invoices). We arrange and sell travel services as principal for the itineraries on this Site and as agent where we book flights and insurance on your behalf — that status is stated on each invoice line.',
      ],
    },
    {
      h: '2. Using the Site',
      p: [
        'You may browse, print and share pages for your own trip planning. You may not scrape, mirror, frame or republish our itinerary content, photography or price tables commercially without written permission. The Site is provided “as is”; we do not warrant that it will be uninterrupted or free of errors, and we may change the itinerary library, prices and features at any time before you book.',
        'You must not attempt to disrupt the Site, probe it for vulnerabilities without our written consent, submit false information, or use the travel assistant to collect other travellers’ data. Accounts, booking references and payment links are personal to you; do not share them.',
      ],
    },
    {
      h: '3. Quotations, itinerary content and pricing',
      p: [
        'Every itinerary on the Site is a starting point, not a fixed package: it is described in the brochure to be tailored. Prices are indicative of the shoulder season at the stated party size, quoted per person with shared accommodation, and exclude international flights unless stated. Class, room category, hotel name and inclusions in your final proposal — not the marketing page — are what we are bound by.',
        'Published “from” prices are the lowest we have sold that journey at recently, not a promise of availability on your dates. Group tour prices ($2,000 – $4,000 per person, 10 – 30 travellers) depend on final group size, and the booking form prices your exact party.',
        'Quotations are held for 21 days from the date on them.',
      ],
    },
    {
      h: '4. Contract formation',
      p: [
        'Nothing on this Site is an offer capable of acceptance. Submitting a booking form is your offer to us; the contract is formed only when we send written confirmation and a booking reference. Payment of the 25% deposit before that confirmation does not bind us to run a journey we cannot staff, and if that happens everything you paid is refunded.',
      ],
    },
    {
      h: '5. Payment terms and the 25% deposit',
      p: [
        'A 25% deposit is payable on acceptance of your booking; the balance falls due 60 days before departure. Booking within 60 days means full payment at booking. Card processing is provided by Stripe under its own terms, which apply to the payment transaction itself.',
        'We may suspend work on an itinerary, release held rooms, or cancel a confirmed booking with full supplier-cost charges if an invoice becomes 14 days overdue after two reminders.',
      ],
    },
    {
      h: '6. Your responsibilities',
      list: [
        'Carry valid travel documents, and satisfy the entry, health and visa rules of Morocco and every transit country.',
        'Take out travel insurance with medical, repatriation and cancellation cover, and give us the policy details when asked.',
        'Disclose anything a guide, driver or hotel ought to know to keep you safe and comfortable.',
        'Behave lawfully and respectfully, follow your leader’s safety instructions, and accept that the itinerary can change for reasons of safety.',
      ],
    },
    {
      h: '7. Our liability',
      p: [
        'We exercise reasonable skill and care in designing, booking and supporting your journey. Where a supplier fails, we will pursue that supplier on your behalf and pass on recoveries, but we are not the operator of the hotel, the airline or the camel train.',
        'Nothing in these terms excludes liability for death or personal injury caused by our negligence, for fraud, or for any other liability that cannot lawfully be limited — including under Moroccan obligations of tort (responsabilité civile) and, for EEA/UK consumers, applicable consumer protection law.',
        'Subject to that, our total liability for a claim other than personal injury is limited to 100% of the price of the journey you paid us, and we are not liable for indirect or consequential loss such as lost earnings, missed connections or disappointment.',
        'Notify us of a problem while travelling, or in writing within 30 days of the end of the trip, and issue proceedings within 18 months, or the claim may be time-barred to the extent the law permits.',
      ],
    },
    {
      h: '8. Intellectual property and photography',
      p: [
        'Text, itinerary design, photographs and the Moroccan Experience name and marks belong to us or are licensed to us. Please do not photograph local people — especially children — without asking, and never for commercial use without a signed model release. We do not commission or accept images of people in Morocco taken without consent.',
      ],
    },
    {
      h: '9. Artificial intelligence on this Site',
      p: [
        'The travel assistant in the corner of the Site is an AI tool that answers from our published journeys, prices and policies, and can hand you to a human. Its guidance is information, not advice, and it is not a contract: nothing it says binds us on price, availability or itinerary. It may be wrong. Do not enter card details, passport numbers or medical information into the chat — the assistant will tell you not to, and will point you to the booking form or a phone call instead.',
      ],
    },
    {
      h: '10. Third-party links, flights and insurance',
      p: [
        'Where we book an air ticket or an insurance policy as your agent, the carrier’s or insurer’s own terms govern that element, and their conditions of carriage or policy wording take precedence over ours for that item.',
      ],
    },
    {
      h: '11. Force majeure',
      p: [
        'Neither of us is liable for failure to perform caused by circumstances beyond our reasonable control — war, terrorism, epidemic, strike, closure of borders or airspace, severe weather, or government direction. We will do what is reasonable to minimise the effect on you, and the refund provisions in the Booking Conditions apply.',
      ],
    },
    {
      h: '12. Unenforceability, assignment and entire agreement',
      p: [
        'If a provision is held invalid, the rest survives. You may not assign your contract without our consent; we may transfer it to a successor entity provided your financial protection is not reduced. These terms plus the Booking Conditions and your confirmation documents are the entire agreement and supersede anything said in chat, on a call or at a trade show.',
      ],
    },
    {
      h: '13. Governing law and disputes',
      p: [
        'These terms are governed by Moroccan law, and the courts of Marrakech have jurisdiction, save that where you are a consumer resident in the EU, UK or elsewhere and your local law gives you a mandatory right to sue where you live, that right is unaffected. We will attempt good-faith negotiation for 30 days before either side starts proceedings, and we will always try mediation first — it is faster than a court and cheaper than a lawyer.',
      ],
    },
  ],
};

const faq = [
  {
    q: 'How much do I pay to secure a trip?',
    a: '25% of the total trip cost by card through Stripe, or by bank transfer. That is our booking deposit and it is non-refundable, but it is not lost if we cancel. The balance is due 60 days before departure. Group leaders can pay one 25% deposit for the whole party, or send each traveller their own card link.',
  },
  {
    q: 'What does a luxury tour actually cost?',
    a: 'From $6,000 per person for seven days, excluding international flights — that is our benchmark for a luxury journey: palace suites, a staffed desert camp at three staff per guest, private vehicles and guides, and every meal and entrance fee but wine. A ten-night Grand Moroccan is from $8,900 pp. Private charter legs are quoted at cost.',
  },
  {
    q: 'How do your group tour prices work?',
    a: 'Between $2,000 and $4,000 per person, and the size of your group decides where in that band you land: 10 travellers pay the top of the band, 30 travellers pay $2,000. Women-only, student and senior departures all follow the same rule, and we cap most senior departures at 20 for comfort rather than margin.',
  },
  {
    q: 'How big are the groups?',
    a: 'Between 10 and 30 travellers plus leaders. We will not run a published group departure below 10 — if it does not fill by 75 days out we offer you a private version, another date, or a full refund including the deposit.',
  },
  {
    q: 'Is Morocco safe for a women-only trip?',
    a: 'Morocco is one of the safest countries in the region for travellers, and our women-only journeys come with a female guide, female driver and women-led cooperatives on the itinerary. What changes with an all-women party is not safety so much as attention: you get stared at less, and you notice more. We send a pre-trip briefing on dress, etiquette and what to do if someone is persistent.',
  },
  {
    q: 'Do I need a visa?',
    a: 'Citizens of the UK, US, EU, Canada, Australia, Japan and around 65 other countries do not need a visa for stays up to 90 days. You must be able to show onward or return travel and, since 2025, a completed digital arrival form. We check your specific rules at booking and remind you 30 days before you fly.',
  },
  {
    q: 'Can you arrange flights?',
    a: 'Yes, as your agent, at the published fare with no markup — you see the fare, taxes and our $40 ticketing fee per person on the invoice. We hold seats for 48 hours while you decide. Most guests fly into Marrakech (RAK) or Casablanca (CMN); for northern itineraries Tangier (TNG) or Rabat (RBA) can save a day.',
  },
  {
    q: 'What is not included?',
    a: 'International flights, lunches and dinners unless listed, drinks, visas, tips, and travel insurance. We are transparent about it because a low headline price with five surprises is not a good price.',
  },
  {
    q: 'Can I pay in instalments?',
    a: 'Yes. 25% on booking, 25% at 120 days (optional), the balance at 60 days. For student and university groups we can split into three equal instalments with PO-linked invoices, and we will work to your finance calendar.',
  },
  {
    q: 'What happens if I fall ill or a border closes?',
    a: 'Your 24/7 duty line is answered by a senior designer, not a call centre, at any hour, in English, French, Spanish, Arabic or German. For events beyond our control we rearrange, relocate and recover as much value as possible, and give you the paperwork your insurer needs the same week.',
  },
  {
    q: 'Is my card data safe?',
    a: 'Card details go to Stripe over an encrypted connection and never reach our servers. We keep only an amount, a date and a payment reference. Nobody at Moroccan Experience will ever ask you for a CVV or an SMS code.',
  },
  {
    q: 'Can I extend a journey?',
    a: 'Almost always, and often on the spot — call or WhatsApp your guide. Two extra riad nights in Marrakech run about $190 per person; three nights in the Agafay or a desert camp extension is one of the things travellers most often add once the pace has changed them.',
  },
];

module.exports = { bookingConditions, privacyPolicy, legalTerms, faq, COMMERCIAL };
