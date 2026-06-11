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
  parking?: number;
  status_en: string;
  status_zh: string;
  representation_en?: string;
  representation_zh?: string;
  photo: string;
  detailsUrl: string;
  details_en?: string;
  details_zh?: string;
  date?: string; // optional 'YYYY-MM' for future sorting
}

export const propertySales: PropertySale[] = [
  {
    category: 'House',
    price: '$5,000,000',
    propertyName_en: 'McGill-Granby Residences',
    propertyName_zh: 'McGill-Granby Residences',
    address_en: '77 McGill Street, Toronto, Ontario',
    address_zh: '77 McGill Street, 多伦多, 安省',
    bedrooms: 5,
    bathrooms: 3,
    status_en: 'Sold',
    status_zh: '已售',
    representation_en: 'Represented Sellers',
    representation_zh: '代表卖家方',
    photo: '/photos/77-mcgill-st.png',
    detailsUrl: '#',
    details_en: 'Breaking Record Sale in my career. Represented Sellers. Builders/Developers were interested in the property, made some calls and got the HIGHEST price compared to the other 2 houses.',
    details_zh: '我职业生涯中的破纪录成交 · 代表卖家方 · 多家开发商对该物业有意,经过几通电话沟通,最终在三栋同类房屋中拿下最高成交价。',
  },
  {
    category: 'Condo',
    price: '$900,000',
    propertyName_en: 'NO55 Mercer Condos',
    propertyName_zh: 'NO55 Mercer Condos',
    address_en: '55 Mercer Street, Toronto, Ontario',
    address_zh: '55 Mercer Street, 多伦多, 安省',
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    status_en: 'Sold',
    status_zh: '已售',
    representation_en: 'Represented Buyer',
    representation_zh: '代表买家方',
    photo: '/photos/55-mercer-st.png',
    detailsUrl: '#',
  },
];
