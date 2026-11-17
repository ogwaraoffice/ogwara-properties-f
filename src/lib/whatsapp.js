import { WHATSAPP_NUMBER } from '../data/listings.js'
import { AREAS, LISTING_FEE } from '../data/listings.js'
import { priceLabel } from './format.js'

const areaName = (id) => AREAS.find((a) => a.id === id)?.name ?? id

export const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`

export const propertyEnquiryLink = (l) =>
  waLink(
    `Hello OgwaraOffice, I'm interested in this property:\n` +
    `Title: ${l.title}\nID: ${l.id}\nArea: ${areaName(l.area)}\nPrice: ${priceLabel(l)}\n\n` +
    `Is it still available?`
  )

export const listingFeeLink = (f) =>
  waLink(
    `Hello OgwaraOffice, I want to list my property and pay the verification and listing fee.\n\n` +
    `Landlord: ${f.name}\nWhatsApp: ${f.phone}\nCategory: ${f.category === 'rent' ? 'For Rent' : f.category === 'sale' ? 'For Sale' : 'Short Let'}\n` +
    `Area: ${areaName(f.area)}\nAsking price: ${f.price}\nDescription: ${f.description}\n\n` +
    `${LISTING_FEE ? 'Listing fee: ' + LISTING_FEE + '\n' : ''}Please send the payment details and next steps. Ref: ${f.ref}`
  )
