'use strict';
/** Morocco destinations — used for destination pages, filters and the chat agent. */
const destinations = [
  {
    slug: 'marrakech',
    name: 'Marrakech',
    region: 'Central south',
    tagline: 'The Red City, and the easiest place in Morocco to feel it all at once',
    image: '/img/destination-marrakech.jpg',
    best: 'Mar – May · Oct – Nov',
    blurb:
      'Marrakech is a city of courtyards: loud outside, silent behind the doors. We base our guides here, and most journeys start or end with two or three nights — enough for the souks, the palaces and one long, lazy hammam afternoon.',
    highlights: ['Jemaa el-Fnaa at the hour the smoke rises', 'Bahia Palace and the Saadian Tombs', 'Le Jardin Secret and the Madrasa Ben Youssef', 'The Ourika valley, 45 minutes away'],
    stays: ['Medina riads with plunge pools', 'Palace hotels on the Koutoubia axis', 'Ourika and Atfif mountain lodges'],
    journeys: ['marrakech-and-the-atlas-foothills', 'luxury-sahara-under-the-stars', 'group-imperial-explorer'],
  },
  {
    slug: 'fes',
    name: 'Fes',
    region: 'North east',
    tagline: 'The most complete medieval city in the Arab world',
    image: '/img/destination-fes.jpg',
    best: 'Apr – Jun · Sep – Oct',
    blurb:
      'Fes al-Bali has 9,000 alleys, no cars, and a craft tradition that has not moved in six hundred years. It is the intellectual heart of Morocco — and the city where the food is most formal and most rewarding.',
    highlights: ['Qarawiyyin university and library (859 AD)', 'Chouara tanneries from the terraces above', 'Foundouk dinners by candlelight', 'Day trips to Volubilis and Meknès'],
    stays: ['Restored medina palace riads', 'Jnan Sbil garden hotels', 'Heritage fondouks, candlelit'],
    journeys: ['imperial-cities-private-circuit', 'bespoke-culinary-morocco', 'group-imperial-explorer'],
  },
  {
    slug: 'sahara-merzouga',
    name: 'The Sahara · Merzouga & Erg Chebbi',
    region: 'South east',
    tagline: 'Dunes tall enough to disappear behind, and skies with no light pollution at all',
    image: '/img/destination-sahara.jpg',
    best: 'Oct – Apr (summers reach 46 °C)',
    blurb:
      'Erg Chebbi rises to 150 m forty minutes from the nearest town. We run camps in both the public dunes and two private concessions where you will see no other vehicle, and we move the camp between nights so the view is never the same one twice.',
    highlights: ['Sunrise balloon over the Erg Chebbi', 'Night with a Sahrawi family and their tea', 'Todra and Dades gorges en route', 'Nomad herding at first light'],
    stays: ['Luxury staffed tented camps', 'Private-concession desert lodges', 'Bivouacs for student groups'],
    journeys: ['luxury-sahara-under-the-stars', 'student-discovery-morocco', 'bespoke-desert-photography'],
  },
  {
    slug: 'chefchaouen',
    name: 'Chefchaouen & the Rif',
    region: 'North',
    tagline: 'A blue city in a green mountain range, and Morocco at its most relaxed',
    image: '/img/destination-chefchaouen.jpg',
    best: 'Apr – Jun · Sep – Oct',
    blurb:
      'Refuge for Andalusian and Jewish communities from 1471 onward, Chefchaouen sits at 600 m under the Rif peaks. It is small, safe, and full of artists; the walks around it are among the best in North Africa.',
    highlights: ['The God’s Bridge waterfall walk', 'Khamis hot springs, booked privately', 'Women’s honey and herb cooperatives', 'Out of season: whole weekends with no other guests'],
    stays: ['Riad guesthouses on the medina edge', 'Mountain retreats with terraces', 'Family-run maisons in Talouine'],
    journeys: ['women-only-wellness-rif', 'women-only-atlas-and-coast', 'the-grand-moroccan'],
  },
  {
    slug: 'essaouira',
    name: 'Essaouira & the Atlantic',
    region: 'West coast',
    tagline: 'Wind, ramparts, thuya wood and the best fish in Morocco',
    image: '/img/destination-essaouira.jpg',
    best: 'Year-round; Apr – Oct for wind',
    blurb:
      'An 18th-century fortified port built on Vauban’s ideas, now the coast’s quiet creative town. Gnaoua music, kitesurf at Diabat, oyster beds in the Oued Ksob, and Marrakech only three hours inland.',
    highlights: ['Skala du Port and the fishing fleet at dawn', 'Mogador island, out of season only', 'Diabat dunes and the Oued Ksob oyster beds', 'Thuya boat-builders and engravers'],
    stays: ['Dar within the medina walls', 'Dune-front tents above the surf', 'Beach houses at Cap Sim'],
    journeys: ['atlantic-coast-essaouira-escape', 'senior-slow-travel-morocco'],
  },
  {
    slug: 'high-atlas',
    name: 'High Atlas & the Berber Villages',
    region: 'Central',
    tagline: 'Two-thousand-metre valleys where the calendar still works differently',
    image: '/img/destination-atlas.jpg',
    best: 'Apr – Jun · Sep – Nov (Toubkal Mar – Oct)',
    blurb:
      'From the Ourika to the Aït Bouguemez, the Atlas is where most travellers find what they did not know they were looking for: walnut terraces, Friday souks, argan and rose harvests, and homestays with a real fire.',
    highlights: ['Toubkal and the Imlil valley', 'Aït Ben Haddou, kasbah of a thousand films', 'The Rose Valley, in May only', 'Trekking with mule support, no luggage limits'],
    stays: ['Canyon and valley lodges', 'Berber homestays (our family-run partners)', 'Refuges for summit attempts'],
    journeys: ['marrakech-and-the-atlas-foothills', 'bespoke-family-expedition', 'women-only-atlas-and-coast'],
  },
  {
    slug: 'rabat-meknes',
    name: 'Rabat, Meknès & Volubilis',
    region: 'North west',
    tagline: 'The imperial north, ninety minutes apart',
    image: '/img/destination-rabat.jpg',
    best: 'Mar – Jun · Sep – Nov',
    blurb:
      'Rabat is the capital most visitors skip and then wish they had not: museums, the Andalusian gardens of the Oudayas, a river marina and an unfinished Almohad minaret. From here, Roman Morocco is 40 minutes away.',
    highlights: ['Chellah necropolis among the ruins', 'Hassan Tower and the Mausoleum of Mohammed V', 'Volubilis mosaics before 9 a.m.', 'The royal stables and granary of Meknès'],
    stays: ['Boutique hotels on the Bou Regreg', 'Kasbah guesthouses outside Meknès', 'Riad suites in the Rabat medina'],
    journeys: ['imperial-cities-private-circuit', 'group-imperial-explorer'],
  },
  {
    slug: 'tangier',
    name: 'Tangier & the Strait',
    region: 'Far north',
    tagline: 'Where two continents can see each other',
    image: '/img/destination-tangier.jpg',
    best: 'May – Sep',
    blurb:
      'Literary, smuggler-haunted, and now genuinely good again. Two nights here makes a nice opener or closer to a northern itinerary, with Cap Spartel, the caves of Hercules and Spain on the horizon.',
    highlights: ['Cap Spartel and the Caves of Hercules', 'The Mendoubia gardens and the Kasbah museum', 'Ferry-line lunches of grilled fish', 'Day trip to Asilah’s art season'],
    stays: ['Kasbah hotels over the strait', 'Seaside villas at Achakar', 'Cap Spartel lighthouse suites'],
    journeys: ['the-grand-moroccan', 'women-only-wellness-rif'],
  },
];

const find = (slug) => destinations.find((d) => d.slug === slug);
module.exports = { destinations, find };
