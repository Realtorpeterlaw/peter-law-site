// Rental listings shown on /past-deals (EN), /chinese/past-deals, /french/past-deals
// by RentalListings.astro. The list is intentionally EMPTY until photos and
// details are ready; the page shows a "no listings yet" message meanwhile.
//
// HOW TO ADD A LISTING
// 1. Put the photo in /public/photos/ as both .jpg and .webp
//    (e.g. /public/photos/my-building.jpg and /public/photos/my-building.webp).
// 2. Copy the EXAMPLE block below into the `rentalListings` array and fill it in.
// 3. Newest listings should go at the top of the array (the page keeps this order).

export interface RentalListing {
  /** Monthly rent as displayed, e.g. '$2,200'. The page adds "/ month" after it. */
  rent: string;
  propertyName_en: string;
  propertyName_zh: string;
  propertyName_fr: string;
  address_en: string;
  address_zh: string;
  address_fr: string;
  bedrooms: number | string;
  bathrooms: number | string;
  /** Optional. Omit or set 0 to hide. */
  parking?: number;
  /** Who Peter represented. Drives the Landlord / Renter filter. */
  role: 'landlord' | 'tenant';
  /** Optional override; defaults to 'Leased' / '已出租' / 'Loué'. */
  status_en?: string;
  status_zh?: string;
  status_fr?: string;
  /** Path to the .jpg photo under /public, e.g. '/photos/my-building.jpg'. A .webp with the same name is used automatically when present. */
  photo: string;
  details_en?: string;
  details_zh?: string;
  details_fr?: string;
  /** 'YYYY-MM' of the lease, optional, shown as a small date line when present. */
  date?: string;
}

/*
EXAMPLE (copy inside the array below and edit):
  {
    rent: '$2,200',
    propertyName_en: 'Example Residences',
    propertyName_zh: 'Example Residences',
    propertyName_fr: 'Example Residences',
    address_en: 'Spadina Ave & St Clair Ave W, Toronto, Ontario',
    address_zh: 'Spadina Ave 与 St Clair Ave W，多伦多，安省',
    address_fr: 'Spadina Ave et St Clair Ave W, Toronto, Ontario',
    bedrooms: 1,
    bathrooms: 1,
    parking: 0,
    role: 'tenant',
    photo: '/photos/example-residences.jpg',
    details_en: 'Secured in under 48 hours for a relocating professional.',
    details_zh: '为一位外地来多伦多工作的客户在 48 小时内完成签约。',
    details_fr: 'Conclu en moins de 48 heures pour un professionnel en relocalisation.',
    date: '2026-09',
  },
*/

export const rentalListings: RentalListing[] = [];
