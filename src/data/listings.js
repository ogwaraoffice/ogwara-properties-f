
// ---------------------------------------------------------------------------
// OgwaraOffice site settings and listings. This is the file you edit to run the site.
// To add a property: copy the template below into LISTINGS, fill it in, save, and
// publish (see README). Photos/videos go in the public/media folder.
// ---------------------------------------------------------------------------

// Your verification & listing fee, shown to landlords. Leave '' to say "confirmed on WhatsApp".
export const LISTING_FEE = '' // e.g. '₦5,000'


export const WHATSAPP_NUMBER = '2347026135346' // +234 702 613 5346
export const WHATSAPP_DISPLAY = '+234 702 613 5346'
export const CALL_NUMBER = '+2347046672738'
export const CALL_DISPLAY = '0704 667 2738'
export const waNumberLink = `https://wa.me/${WHATSAPP_NUMBER}`
export const EMAIL = 'ogwaraoffice@gmail.com'
export const TAGLINE = 'Find · Rent · Buy · Invest'

export const AREAS = [
  { id: 'gra', name: 'GRA' },
  { id: 'ekosodin', name: 'Ekosodin (near UNIBEN Back Gate)' },
  { id: 'uselu', name: 'BDPA, Uselu (opp. UNIBEN Main Gate)' },
  { id: 'osasogie', name: 'Osasogie / UBTH Gate' },
  { id: 'airport', name: 'Airport Road' },
  { id: 'ekenwan', name: 'Ekenwan Road' },
  { id: 'sakponba', name: 'Upper Sakponba' },
]

export const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'rent', label: 'For Rent' },
  { id: 'sale', label: 'For Sale' },
  { id: 'shortlet', label: 'Short Let' },
]

export const CATEGORY_LABEL = { rent: 'For Rent', sale: 'For Sale', shortlet: 'Short Let' }

export const REVIEW_ASPECTS = [
  { id: 'light', label: 'Light stability' },
  { id: 'water', label: 'Water availability' },
  { id: 'road', label: 'Road condition' },
  { id: 'landlord', label: 'Landlord cooperation' },
]

// TEMPLATE (copy, paste inside the [ ] below, and edit):
// {
//   id: 'OGW-1001', title: 'Neat Self-Contain, Ekosodin',
//   category: 'rent',            // 'rent' | 'sale' | 'shortlet'
//   type: 'Self-Contain',        // Self-Contain, Single Room, 1-Bed Flat, 2-Bed Flat, 3-Bed Flat, Land Plot, Standalone House, Block of Flats, Furnished Apartment
//   area: 'ekosodin',            // gra | ekosodin | uselu | osasogie | airport | ekenwan | sakponba
//   street: 'Off Ekosodin Road', landmarks: ['UNIBEN Back Gate'],
//   price: 250000,               // numbers only
//   period: 'year',              // 'year' for rent, 'night' for short let, null for sale
//   beds: 1, baths: 1,           // null for land
//   studentWalk: 6,              // minutes' walk to UNIBEN, or null
//   power: 'Prepaid meter, Band B grid', water: 'Borehole, running daily',
//   description: 'Write a short, honest description.',
//   images: ['/media/OGW-1001-1.jpg', '/media/OGW-1001-2.jpg'],  // files in public/media
//   video: '/media/OGW-1001.mp4',                               // optional
//   verified: true,              // only after your team has checked the property
// },
export const LISTINGS = [
]
