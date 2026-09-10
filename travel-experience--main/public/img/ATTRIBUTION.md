# Image credits

Two sets of imagery ship in this build. **Both are placeholders for a demo — replace them with
commissioned photography before launch.** Keep the filenames and drop the new files in this folder.

## 1. Sourced from the public web (previous build step)

Used for destination pages, several journey cards and the audience tiles.

| File | Subject | Source (as returned by the image search) |
|---|---|---|
| `hero-marrakech.jpg` | Jemaa el-Fna and the Koutoubia at sunset | gettyimages.com (Marrakech skyline) |
| `sahara-camel-train.jpg` / `-portrait.jpg` | Camel caravan, Erg Chebbi dunes | reuters.com pictures / gettyimages.com |
| `atlas-trekking.jpg` / `-portrait.jpg` | Trekkers below Toubkal, High Atlas | morofun.com |
| `riad-courtyard.jpg` / `-portrait.jpg` | Riad courtyard with pool | malika-in-morocco.com |
| `ait-benhaddou.jpg`, `ait-benhaddou-aerial.jpg` | Aït Benhaddou ksar | archeyes.com |
| `chefchaouen.jpg`, `chefchaouen-portrait.jpg` | The blue city | journalofnomads.com |
| `essaouira-port.jpg` | Fishing boats and the port ramparts | citytoursmorocco.com |
| `fes-tannery.jpg` | Chouara tanneries, Fes el-Bali | afar.com / theculturemap.com |
| `desert-camp-dusk.jpg` | Luxury desert camp, dinner service | saharaservices.info |
| `rooftop-lounge.jpg` | Rooftop lounge at golden hour | squarespace-cdn via themostperfectview.com |
| `hammam.jpg` | Marble hammam room | pexels.com |
| `souk-spices.jpg` | Spice seller in the souk | stockcake.com |
| `moroccan-table.jpg` | Moroccan dishes laid on a table | pinterest (food editorial) |
| `women-group.jpg` | Women hiking together | canyoncalling.com |
| `students-group.jpg` | Students trekking with packs | studentsfare.com |
| `seniors-couple.jpg` | Older couple hiking | vecteezy.com |
| `balloons.jpg` | Hot-air balloons at sunrise | sunriseballoonmarrakech.com |

Files that arrived with stock-agency watermarks (dreamstime etc.) were discarded and are not shipped.

Mapped onto the site's semantic filenames by this build:
`destination-marrakech ← hero-marrakech`, `destination-fes ← fes-tannery`,
`destination-sahara ← sahara-camel-train-portrait`, `destination-chefchaouen ← chefchaouen-portrait`,
`destination-essaouira ← essaouira-port`, `destination-atlas ← atlas-trekking-portrait`,
`destination-rabat ← ait-benhaddou`, `journey-wellness / journal-hammam ← hammam`,
`journey-grand-morocco / destination-tangier ← ait-benhaddou / essaouira-port`,
`journey-group-imperial / tour-group ← desert-camp-dusk`, `journey-culinary ← moroccan-table`,
`journal-planning ← souk-spices`, `story-guides ← rooftop-lounge`,
`audience-women/students/seniors ← women-group / students-group / seniors-couple`.

## 2. Generated for this build (AI)

Created specifically for the brand so the hero, the four journey families and the people-led cards
share one art direction (warm film tones, natural light, editorial framing):

`hero-desert.jpg` · `hero-riad.jpg` · `hero-medina.jpg` · `journey-luxury-camp.jpg` ·
`journey-atlas-riad.jpg` · `journey-fes-zellige.jpg` · `journey-women.jpg` · `journey-students.jpg` ·
`journey-seniors.jpg` · `journey-family.jpg` · `journey-rif-wellness.jpg` · `tour-private.jpg` ·
`tour-luxury.jpg` · `tour-bespoke.jpg` · `journal-women.jpg` · `journal-group-vs-private.jpg`

These are synthetic images. They are safe to use as visual placeholders in a demo, but they are not
documentary photographs of the properties named on the site — swap them for real images before any
public launch, and never present them as images of a specific hotel or camp.

## Swapping in your own photography

The site only ever references these logical paths (set in `src/data/*.js` and a few templates):
`hero-*`, `destination-*`, `journey-*`, `tour-*`, `audience-*`, `journal-*`, `story-guides`.
Cards are `3:4` (portrait), section tiles `4:5`, page heroes `16:9` — anything close works, since
every image is `object-fit: cover`. A missing file degrades gracefully to the brand gradient rather
than a broken-image icon.
