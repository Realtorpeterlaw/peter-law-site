// Past property sales — used by PropertySales.astro on /past-deals.
// Add new listings here. category drives the filter system.

export interface PropertySale {
  category: 'House' | 'Condo' | 'Rental';
  price: string;
  propertyName_en: string;
  propertyName_zh: string;
  address_en: string;
  address_zh: string;
  bedrooms: number;
  bathrooms: number;
  status_en: string;
  status_zh: string;
  photo: string;
  detailsUrl: string;
  date?: string; // optional 'YYYY-MM' for future sorting
}

export const propertySales: PropertySale[] = [
  {
    category: 'House',
    price: '$5,000,000',
    propertyName_en: 'McGill-Granby Residences',
    propertyName_zh: 'McGill-Granby Residences',
    address_en: '77 McGill Street',
    address_zh: '77 McGill Street',
    bedrooms: 5,
    bathrooms: 3,
    status_en: 'Sold',
    status_zh: '已售',
    photo: '/photos/77-mcgill-st.png',
    detailsUrl: '#',
  },
];
