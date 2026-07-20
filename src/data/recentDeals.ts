// Centralized recent deals data — sorted newest-first via YYYY-MM `date` field.
// Carousel on homepage takes top 3; /about page shows the full archive.

export interface DealRaw {
  date: string;                // 'YYYY-MM' — sort key (source of truth)
  intersection_en: string;
  intersection_zh: string;
  city_en: string;
  city_zh: string;
  rent: string;                // shared (currency-agnostic display)
  note_en: string;
  note_zh: string;
  status_en?: string;          // 'Rental' / 'Sales' / 'Commercial'
  status_zh?: string;          // '租赁' / '销售' / '商业'
}

export interface DealView {
  monthYear: string;
  intersection: string;
  city: string;
  rent: string;
  period: string;
  note: string;
  status: string;
}

const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Add new deals here. Order doesn't matter — getDeals() sorts by date.
export const dealsRaw: DealRaw[] = [
  {
    date: '2026-06',
    intersection_en: 'Jarvis St & Carlton St',
    intersection_zh: 'Jarvis St 与 Carlton St',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    rent: '$2,050',
    note_en: 'International Worker, secured First and Last months Rent ONLY!',
    note_zh: '国际背景租客 · 仅以首月加末月租金完成签约。',
  },
  {
    date: '2026-06',
    intersection_en: 'Jarvis St & Queen St E',
    intersection_zh: 'Jarvis St 与 Queen St E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    rent: '$2,200',
    note_en: 'Easy and Smooth Transaction. Brand-new, Never lived in Unit',
    note_zh: '流程顺畅,签约轻松 · 全新户型,从未入住。',
  },
  {
    date: '2026-07-31',
    intersection_en: 'Warden Ave & Hwy 7',
    intersection_zh: 'Warden Ave 与 Hwy 7',
    city_en: 'Markham, Ontario',
    city_zh: '万锦市, 安省',
    rent: '$2,300',
    note_en: 'Secured AAA tenant for my 1 Bedroom + Den listing at Markham. Reliable · Immediate move-in!',
    note_zh: '为万锦市的一房加书房房源签下 AAA 级租客 · 可靠 · 立即入住!',
    status_en: 'Represented Landlord',
    status_zh: '代表房东方',
  },
  {
    date: '2026-07-30',
    intersection_en: 'Leslie St & Sheppard Ave E',
    intersection_zh: 'Leslie St 与 Sheppard Ave E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    rent: '$2,400',
    note_en: 'Secured this home for a lovely returning client! Gorgeous upgrades, Porcelain bath-tub, and Never lived-in! Negotiated less than listed price.',
    note_zh: '为回头客户成功签约这套住宅 · 精装升级 · 陶瓷浴缸 · 全新未入住 · 低于挂牌价签下。',
  },
  {
    date: '2026-07-25',
    intersection_en: 'Kingston Rd & Lawrence Ave E',
    intersection_zh: 'Kingston Rd 与 Lawrence Ave E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    rent: '$4,100',
    note_en: 'Secured a lovely home for an Ambitious family, at a great value!',
    note_zh: '为一户有抱负的家庭签下心仪的住宅 · 性价比出色。',
  },
  {
    date: '2026-07-20',
    intersection_en: 'Parliament St & Queens Quay E',
    intersection_zh: 'Parliament St 与 Queens Quay E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    rent: '$2,500',
    note_en: 'Desired Building, International Worker, New Credit, First and Last ONLY!',
    note_zh: '理想的物业 · 国际背景租客 · 新建立信用记录 · 仅以首月加末月租金完成签约。',
  },
  {
    date: '2026-07-15',
    intersection_en: 'Yonge St & Bloor St E',
    intersection_zh: 'Yonge St 与 Bloor St E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    rent: '$3,350',
    note_en: 'Secured this gem for my mature clients. Great layout, new build, with great taste in design.',
    note_zh: '为成熟客户成功签约这套精品单元 · 户型出色 · 新建项目 · 设计品味卓越。',
  },
  {
    date: '2026-07-08',
    intersection_en: 'Jarvis St & Dundas St E',
    intersection_zh: 'Jarvis St 与 Dundas St E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    rent: '$2,400',
    note_en: 'International Worker, secured First and Last months Rent ONLY! +$450 Discount!!',
    note_zh: '国际背景租客 · 仅以首月加末月租金完成签约 · 协议每月减租 $450。',
  },
  {
    date: '2026-06',
    intersection_en: 'Birchmount Rd & Lawrence Ave E',
    intersection_zh: 'Birchmount Rd 与 Lawrence Ave E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    rent: '$2,000',
    note_en: 'Great catch. Limited supplies. Negotiated $100 from listed price!!',
    note_zh: '难得好房,房源紧俏。在挂牌价基础上谈下每月 $100。',
  },
  {
    date: '2026-04',
    intersection_en: 'James St S & Hwy 8',
    intersection_zh: 'James St S 与 Hwy 8',
    city_en: 'Hamilton, Ontario',
    city_zh: '汉密尔顿,安省',
    rent: '$1,850',
    note_en: 'Secured this unit for a Newcomer Client. Couple days new to Canada. Never-lived in, Brand-new Unit!',
    note_zh: '为刚抵加几天的新移民客户成功签约 · 全新户型,从未入住。',
  },
  {
    date: '2026-05',
    intersection_en: 'Yonge St & Bloor St E',
    intersection_zh: 'Yonge St 与 Bloor St E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    rent: '$3,600',
    note_en: 'Secured this unit for a Married Couple. Smooth and easy transition for my clients! Convenience and AAA Location',
    note_zh: '为一对已婚夫妇成功签约 · 流程顺畅 · 黄金地段 · AAA 级位置。',
  },
];

export function getDeals(zh: boolean): DealView[] {
  return [...dealsRaw]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((d) => {
      const [yyyy, mm] = d.date.split('-');
      const monthIdx = parseInt(mm, 10) - 1;
      return {
        monthYear: zh
          ? `${yyyy} 年 ${parseInt(mm, 10)} 月`
          : `${MONTHS_EN[monthIdx]} ${yyyy}`,
        intersection: zh ? d.intersection_zh : d.intersection_en,
        city: zh ? d.city_zh : d.city_en,
        rent: d.rent,
        period: zh ? '/ 月' : '/ month',
        note: zh ? d.note_zh : d.note_en,
        status: zh ? (d.status_zh ?? '代表租客方') : (d.status_en ?? 'Represented Tenant'),
      };
    });
}
