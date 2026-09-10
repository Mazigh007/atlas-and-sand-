'use strict';
/** Journal / inspirations — short editorial pieces, also used by the chat agent for “what should I do in…” answers. */
const posts = [
  {
    slug: 'how-to-plan-a-trip-to-morocco',
    title: 'How to plan a trip to Morocco without drowning in advice',
    date: '2026-08-14',
    read: '7 min',
    category: 'Planning',
    image: '/img/journal-planning.jpg',
    lede: 'The gap between “I want to go to Morocco” and a real itinerary is mostly a series of small decisions. Here is how our designers make them.',
    body: [
      { h: 'Begin with the feeling, not the list', p: 'Most travellers arrive with eight must-see places and no idea which of them they actually care about. We ask a different question first: when you come back, what do you want to be able to describe? Silence and space points one way — desert, Anti-Atlas, the coast in February. Density and colour points another — Fes, Marrakech, the souks at 8 a.m. Neither answer is better. It just decides where you sleep.' },
      { h: 'Pick the season you can afford to love', p: 'Morocco has three travel seasons and only two of them are obvious. March to early June and late September to November are warm in the south and cool in the mountains, with everything open. July and August are 40 °C-plus inland; that is fine if you plan for a pool and a late start and terrible if you wanted the dunes. The shoulder of Ramadan moves every year and is a genuinely wonderful, genuinely complicated time to visit — we will tell you what shuts and what becomes unforgettable.' },
      { h: 'Do not fight the distances', p: 'Marrakech to Merzouga is nine hours of real driving if you want to arrive before dark and still see something. Nine “top ten” destinations in ten nights produces a trip where nobody remembers a single afternoon. Our favourite structure for first-timers is three bases, one long transfer in the middle, and one day with nothing in it at all.' },
      { h: 'Decide private or group before you choose hotels', p: 'A private tour costs more per person and buys flexibility: you can sleep in, change your mind at lunch, and swap the camel trek for a hammam. A group departure of 10 – 30 travellers runs $2,000 – $4,000 per person and buys company, local knowledge at double density, and a price that falls as your party grows. Neither is the adult choice and the childish one.' },
      { h: 'Budget honestly, then build in one splurge', p: 'For seven days in the middle tier, plan on $2,400 – $3,600 per person excluding flights; luxury starts at $6,000. Add $400 – $800 per person of cash for lunches, tips and the rug you were not going to buy. Spend the money you are torn about on one thing that changes the texture of the whole week: a balloon at dawn, a hammam you had written off, one night in a camp far from the road.' },
    ],
  },
  {
    slug: 'a-hammam-explained',
    title: 'A hammam, explained before you go in',
    date: '2026-07-02',
    read: '5 min',
    category: 'Culture',
    image: '/img/journal-hammam.jpg',
    lede: 'Black soap, a rough mitt, a marble slab, and forty minutes in which you are neither undressed nor dressed, entirely passive, and — by the end — a different person.',
    body: [
      { h: 'What it is', p: 'A hammam is a steam bath built around a heated marble slab. In Morocco it is a social institution first, a spa second. You will be washed by someone who has done it nine hundred times, and it is brisk, warm and faintly industrial. It is not candles.' },
      { h: 'The sequence', p: 'Twenty minutes in the steam to open the pores. Then you are scrubbed with bessa — olive-oil black soap made from pressed olives and ash — left to soften, and exfoliated with a kessa mitt, which removes a surprising amount of skin with a lot of rolling and very little rubbing. Rinse, ghassoul clay mask for five minutes, rinse, wrap, tea, sleep for an hour. Total: 60 – 90 minutes.' },
      { h: 'What to expect of your own reaction', p: 'Most first-timers are hot and slightly claustrophobic for six minutes, then completely absent-minded for twenty. If you are pregnant, on blood pressure medication, or have a heart condition, choose the seated version or a private steam room, and tell the practitioner — ours always ask.' },
      { h: 'Private versus public', p: 'Public neighbourhood hammams are mixed by hour, not by curtain: separate times for men and women, family hours at weekends. Travellers who want the experience without the exposure should book a private room, and our women-only groups take over whole buildings for the afternoon.' },
      { h: 'After', p: 'No shower that night; the soap is still working. Drink two litres. Buy the black soap — it is the only part of the trip you can take home in a jar and it lasts a year.' },
    ],
  },
  {
    slug: 'women-travelling-in-morocco',
    title: 'Women travelling in Morocco: what actually happens, and what does not',
    date: '2026-06-11',
    read: '8 min',
    category: 'Travel with us',
    image: '/img/journal-women.jpg',
    lede: 'The honest briefing we give every guest on our women-only departures, published because the internet versions are either scare stories or nonsense.',
    body: [
      { h: 'Attention: the realistic version', p: 'In the medinas you will be looked at and, occasionally, spoken to — usually a shopkeeper, sometimes a man with no shop. Verbal remarks in Arabic you will not always understand, rarely aggressive, often bafflingly persistent if you are polite twice instead of once. The standard response, which works: stop walking, look at them flatly, say “la, shukran” once, and keep walking. Do not smile to soften it. Do not engage. It is not harassment; it is noise, and it stops the moment you stop being interesting.' },
      { h: 'What nobody warns you about', p: 'The exhaustion of being visible all day in a place with little shade. Heat, dehydration and an empty stomach make everything feel sharper. We schedule a two-hour afternoon gap in every medina day, and travellers who use it report a completely different trip from those who push through.' },
      { h: 'Dress', p: 'Morocco is a Muslim country with a very wide range of practice: Marrakech is not Chefchaouen is not the Rif. Loose clothing that covers shoulders and knees reduces attention materially and is not about modesty as a moral claim — it is about not being stared at. Pack a scarf; it is useful for mosques you may enter and for a windy dune evening as well.' },
      { h: 'Alone, at night', p: 'In Marrakech and Fes, take a petit taxi rather than walking between medinas after dark, and ask your riad to text the driver’s number. Solo walking within your own neighbourhood is normal — Moroccan women do it constantly — and being a guest in a whole-house booking simply removes the question.' },
      { h: 'Why an all-women group works', p: 'Nothing about Morocco changes on a women-only departure except who is looking. Guides, drivers and cooks are women, and the itinerary is built around doors that only open that way: the women’s argan cooperative at Douar Oumersia, a hammam emptied for you, a family kitchen in the Rif. You notice more because you are spending less of the day managing a situation.' },
    ],
  },
  {
    slug: 'group-or-private',
    title: 'Group or private: the four questions that decide it',
    date: '2026-05-19',
    read: '6 min',
    category: 'Planning',
    image: '/img/journal-group-vs-private.jpg',
    lede: '$2,000 – $4,000 for a group of 10 – 30, or from $2,400 per person privately. It is rarely a money question once you answer these.',
    body: [
      { h: 'How do you feel about deciding things with other people?', p: 'A group departure is a small society: someone is always slightly behind, someone wants to stop at every tile workshop, and someone else is reading a book on the terrace at 6 a.m. If autonomy is your non-negotiable, private costs more and is correct. If you like a party and want the day to be already arranged, a group is better than you expect.' },
      { h: 'Who are you travelling with?', p: 'Students, solo travellers, and seniors travel very well in groups; local guides at a ratio of 1:10 mean more knowledge per person than a private tour usually delivers. Families with teenagers, and anyone with a specific skill they want to use (photography, language, cooking), do better private, where the guide’s day belongs to you.' },
      { h: 'Is your trip date flexible?', p: 'Group departures run on fixed dates, four or five a year, and the best ones fill 5 – 7 months out. Private journeys run any day, which matters if you need the desert in a new-moon week or want the rose harvest in Kelaa M’Gouna in May, which lasts eleven days.' },
      { h: 'What is the real per-person difference?', p: 'A 20-person group at seven nights is roughly $2,400 pp; the identical route, privately with your own vehicle and guide, is $3,400 – $4,200 pp. That difference buys the vehicle to yourself and the right to skip an activity without an apology. It does not buy better riads: on group departures we book the same properties we use for private guests, in twin rooms.' },
    ],
  },
];

const find = (slug) => posts.find((p) => p.slug === slug);
module.exports = { posts, find };
