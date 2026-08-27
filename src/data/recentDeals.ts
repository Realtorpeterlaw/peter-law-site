// Centralized recent deals data — sorted newest-first via YYYY-MM `date` field.
// Carousel on homepage takes top 3; /about page shows the full archive.

export type DealLang = 'en' | 'zh' | 'fr';

export interface DealRaw {
  date: string;                // 'YYYY-MM' — sort key (source of truth)
  intersection_en: string;
  intersection_zh: string;
  intersection_fr: string;
  city_en: string;
  city_zh: string;
  city_fr: string;
  rent: string;                // shared (currency-agnostic display)
  note_en: string;
  note_zh: string;
  note_fr: string;
  status_en?: string;          // 'Rental' / 'Sales' / 'Commercial'
  status_zh?: string;          // '租赁' / '销售' / '商业'
  status_fr?: string;
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

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

// Add new deals here. Order doesn't matter — getDeals() sorts by date.
export const dealsRaw: DealRaw[] = [
  {
    date: '2026-09-05',
    intersection_en: 'Church St & Wellesley St E',
    intersection_zh: 'Church St 与 Wellesley St E',
    intersection_fr: 'Church St et Wellesley St E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    city_fr: 'Toronto, Ontario',
    rent: '$1,750',
    note_en: "Brutal market for international students. 10+ viewings, secured a unit within 7 days before occupancy date. Congratulations, your new chapter begins!",
    note_zh: '国际学生市场异常艰难 · 10+ 次看房,在入住日期前 7 天成功锁定房源 · 恭喜您开启新篇章!',
    note_fr: "Marché impitoyable pour les étudiants internationaux. 10+ visites, unité sécurisée dans les 7 jours avant la date d'occupation. Félicitations, un nouveau chapitre commence!",
  },
  {
    date: '2026-08-30',
    intersection_en: 'Lower Sherbourne St & Front St E',
    intersection_zh: 'Lower Sherbourne St 与 Front St E',
    intersection_fr: 'Lower Sherbourne St et Front St E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    city_fr: 'Toronto, Ontario',
    rent: '$2,250',
    note_en: "HOT Season…RENTED 1 week before the Tenant move-out day. 4 DAYS on the market. $100 over asking. Thanks for your trust!",
    note_zh: '旺季再战……在原租客搬走前一周就完成签约 · 上市仅 4 天 · 高出叫价 $100 成交 · 感谢您的信任!',
    note_fr: "Pleine saison…LOUÉ une semaine avant le départ du locataire. 4 JOURS sur le marché. 100 $ au-dessus du prix demandé. Merci de votre confiance!",
    status_en: 'Represented Landlord',
    status_zh: '代表房东方',
    status_fr: 'Représente le propriétaire',
  },
  {
    date: '2026-08-28',
    intersection_en: 'Lower Sherbourne St & Front St E',
    intersection_zh: 'Lower Sherbourne St 与 Front St E',
    intersection_fr: 'Lower Sherbourne St et Front St E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    city_fr: 'Toronto, Ontario',
    rent: '$2,450',
    note_en: "HOT Season…Sniped a 1Bed + Den before September 1st! Situated by St Lawrence Market. Nofrills below!",
    note_zh: '旺季厮杀……九月一号前抢到这套 1 房 + 书房!位于 St Lawrence Market 旁,楼下就是 Nofrills!',
    note_fr: "Pleine saison…1 chambre + den arraché avant le 1er septembre! Situé près du St Lawrence Market. Nofrills en bas!",
  },
  {
    date: '2026-08-25',
    intersection_en: 'Church St & Shuter St',
    intersection_zh: 'Church St 与 Shuter St',
    intersection_fr: 'Church St et Shuter St',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    city_fr: 'Toronto, Ontario',
    rent: '$2,850',
    note_en: 'Perfect layout for two. Corner unit, with a grocery store on the ground floor!',
    note_zh: '两人居住的理想户型 · 转角单元 · 楼下即有超市!',
    note_fr: 'Aménagement parfait pour deux. Unité de coin, avec épicerie au rez-de-chaussée!',
  },
  {
    date: '2026-08-20',
    intersection_en: 'Bayview Ave & Finch Ave E',
    intersection_zh: 'Bayview Ave 与 Finch Ave E',
    intersection_fr: 'Bayview Ave et Finch Ave E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    city_fr: 'Toronto, Ontario',
    rent: '$6,600',
    note_en: 'Desirable neighbourhood — 3,000+ sq ft of living space.',
    note_zh: '热门社区 · 逾 3,000 平方英尺居住面积。',
    note_fr: 'Quartier prisé — plus de 3 000 pi² d\'espace habitable.',
  },
  {
    date: '2026-08-15',
    intersection_en: 'Yonge St & Dundas St',
    intersection_zh: 'Yonge St 与 Dundas St',
    intersection_fr: 'Yonge St et Dundas St',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    city_fr: 'Toronto, Ontario',
    rent: '$3,300',
    note_en: 'Secured a AAA tenant for my landlord client. Headache-free.',
    note_zh: '为业主客户成功签下 AAA 级租客 · 全程省心。',
    note_fr: 'Locataire AAA obtenu pour mon client propriétaire. Sans tracas.',
    status_en: 'Represented Landlord',
    status_zh: '代表房东方',
    status_fr: 'Représente le propriétaire',
  },
  {
    date: '2026-08',
    intersection_en: 'Bayview Ave & Hwy 7',
    intersection_zh: 'Bayview Ave 与 Hwy 7',
    intersection_fr: 'Bayview Ave et Hwy 7',
    city_en: 'Markham, Ontario',
    city_zh: '万锦市, 安省',
    city_fr: 'Markham, Ontario',
    rent: '$2,500',
    note_en: 'Rare find. Soaring 10+ ft ceilings. Spacious 1 bedroom + den with parking.',
    note_zh: '难得房源 · 10 英尺以上超高天花板 · 宽敞一房加书房,带车位。',
    note_fr: 'Trouvaille rare. Plafonds de plus de 10 pieds. Spacieux 1 chambre + bureau avec stationnement.',
  },
  {
    date: '2026-06',
    intersection_en: 'Jarvis St & Carlton St',
    intersection_zh: 'Jarvis St 与 Carlton St',
    intersection_fr: 'Jarvis St et Carlton St',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    city_fr: 'Toronto, Ontario',
    rent: '$2,050',
    note_en: 'International Worker, secured First and Last months Rent ONLY!',
    note_zh: '国际背景租客 · 仅以首月加末月租金完成签约。',
    note_fr: 'Travailleur international · signé uniquement avec premier et dernier mois de loyer.',
  },
  {
    date: '2026-06',
    intersection_en: 'Jarvis St & Queen St E',
    intersection_zh: 'Jarvis St 与 Queen St E',
    intersection_fr: 'Jarvis St et Queen St E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    city_fr: 'Toronto, Ontario',
    rent: '$2,200',
    note_en: 'Easy and Smooth Transaction. Brand-new, Never lived in Unit',
    note_zh: '流程顺畅,签约轻松 · 全新户型,从未入住。',
    note_fr: 'Transaction fluide et rapide. Unité neuve, jamais habitée.',
  },
  {
    date: '2026-07-31',
    intersection_en: 'Warden Ave & Hwy 7',
    intersection_zh: 'Warden Ave 与 Hwy 7',
    intersection_fr: 'Warden Ave et Hwy 7',
    city_en: 'Markham, Ontario',
    city_zh: '万锦市, 安省',
    city_fr: 'Markham, Ontario',
    rent: '$2,300',
    note_en: 'Secured AAA tenant for my 1 Bedroom + Den listing at Markham. Reliable · Immediate move-in!',
    note_zh: '为万锦市的一房加书房房源签下 AAA 级租客 · 可靠 · 立即入住!',
    note_fr: 'Locataire AAA obtenu pour mon 1 chambre + bureau à Markham. Fiable · emménagement immédiat!',
    status_en: 'Represented Landlord',
    status_zh: '代表房东方',
    status_fr: 'Représente le propriétaire',
  },
  {
    date: '2026-07-30',
    intersection_en: 'Leslie St & Sheppard Ave E',
    intersection_zh: 'Leslie St 与 Sheppard Ave E',
    intersection_fr: 'Leslie St et Sheppard Ave E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    city_fr: 'Toronto, Ontario',
    rent: '$2,400',
    note_en: 'Secured this home for a lovely returning client! Gorgeous upgrades, Porcelain bath-tub, and Never lived-in! Negotiated less than listed price.',
    note_zh: '为回头客户成功签约这套住宅 · 精装升级 · 陶瓷浴缸 · 全新未入住 · 低于挂牌价签下。',
    note_fr: 'Signé pour un(e) client(e) fidèle! Améliorations superbes, baignoire en porcelaine, jamais habitée. Négocié sous le prix affiché.',
  },
  {
    date: '2026-07-25',
    intersection_en: 'Kingston Rd & Lawrence Ave E',
    intersection_zh: 'Kingston Rd 与 Lawrence Ave E',
    intersection_fr: 'Kingston Rd et Lawrence Ave E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    city_fr: 'Toronto, Ontario',
    rent: '$4,100',
    note_en: 'Secured a lovely home for an Ambitious family, at a great value!',
    note_zh: '为一户有抱负的家庭签下心仪的住宅 · 性价比出色。',
    note_fr: 'Belle résidence signée pour une famille ambitieuse, à un excellent rapport qualité-prix!',
  },
  {
    date: '2026-07-20',
    intersection_en: 'Parliament St & Queens Quay E',
    intersection_zh: 'Parliament St 与 Queens Quay E',
    intersection_fr: 'Parliament St et Queens Quay E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    city_fr: 'Toronto, Ontario',
    rent: '$2,500',
    note_en: 'Desired Building, International Worker, New Credit, First and Last ONLY!',
    note_zh: '理想的物业 · 国际背景租客 · 新建立信用记录 · 仅以首月加末月租金完成签约。',
    note_fr: 'Immeuble recherché · travailleur international · crédit récent · premier et dernier mois seulement.',
  },
  {
    date: '2026-07-15',
    intersection_en: 'Yonge St & Bloor St E',
    intersection_zh: 'Yonge St 与 Bloor St E',
    intersection_fr: 'Yonge St et Bloor St E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    city_fr: 'Toronto, Ontario',
    rent: '$3,350',
    note_en: 'Secured this gem for my mature clients. Great layout, new build, with great taste in design.',
    note_zh: '为成熟客户成功签约这套精品单元 · 户型出色 · 新建项目 · 设计品味卓越。',
    note_fr: 'Ce bijou signé pour des client(e)s exigeant(e)s. Superbe aménagement, construction neuve, design soigné.',
  },
  {
    date: '2026-07-08',
    intersection_en: 'Jarvis St & Dundas St E',
    intersection_zh: 'Jarvis St 与 Dundas St E',
    intersection_fr: 'Jarvis St et Dundas St E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    city_fr: 'Toronto, Ontario',
    rent: '$2,400',
    note_en: 'International Worker, secured First and Last months Rent ONLY! +$450 Discount!!',
    note_zh: '国际背景租客 · 仅以首月加末月租金完成签约 · 协议每月减租 $450。',
    note_fr: 'Travailleur international · signé avec premier et dernier mois seulement · réduction négociée de 450 $/mois!',
  },
  {
    date: '2026-06',
    intersection_en: 'Birchmount Rd & Lawrence Ave E',
    intersection_zh: 'Birchmount Rd 与 Lawrence Ave E',
    intersection_fr: 'Birchmount Rd et Lawrence Ave E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    city_fr: 'Toronto, Ontario',
    rent: '$2,000',
    note_en: 'Great catch. Limited supplies. Negotiated $100 from listed price!!',
    note_zh: '难得好房,房源紧俏。在挂牌价基础上谈下每月 $100。',
    note_fr: 'Belle prise. Offre limitée. Négocié 100 $ de moins que le prix affiché!',
  },
  {
    date: '2026-04',
    intersection_en: 'James St S & Hwy 8',
    intersection_zh: 'James St S 与 Hwy 8',
    intersection_fr: 'James St S et Hwy 8',
    city_en: 'Hamilton, Ontario',
    city_zh: '汉密尔顿,安省',
    city_fr: 'Hamilton, Ontario',
    rent: '$1,850',
    note_en: 'Secured this unit for a Newcomer Client. Couple days new to Canada. Never-lived in, Brand-new Unit!',
    note_zh: '为刚抵加几天的新移民客户成功签约 · 全新户型,从未入住。',
    note_fr: "Signé pour un(e) client(e) nouvel(le) arrivant(e) au Canada depuis quelques jours. Unité neuve, jamais habitée!",
  },
  {
    date: '2026-05',
    intersection_en: 'Yonge St & Bloor St E',
    intersection_zh: 'Yonge St 与 Bloor St E',
    intersection_fr: 'Yonge St et Bloor St E',
    city_en: 'Toronto, Ontario',
    city_zh: '多伦多,安省',
    city_fr: 'Toronto, Ontario',
    rent: '$3,600',
    note_en: 'Secured this unit for a Married Couple. Smooth and easy transition for my clients! Convenience and AAA Location',
    note_zh: '为一对已婚夫妇成功签约 · 流程顺畅 · 黄金地段 · AAA 级位置。',
    note_fr: 'Signé pour un couple marié. Transition facile et fluide pour mes clients! Emplacement AAA très pratique.',
  },
];

export function getDeals(langOrZh: DealLang | boolean = 'en'): DealView[] {
  // Backwards-compatible: allow existing callers passing a boolean (true === zh)
  const lang: DealLang = typeof langOrZh === 'boolean' ? (langOrZh ? 'zh' : 'en') : langOrZh;
  return [...dealsRaw]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((d) => {
      const [yyyy, mm] = d.date.split('-');
      const monthIdx = parseInt(mm, 10) - 1;
      let monthYear: string;
      if (lang === 'zh') monthYear = `${yyyy} 年 ${parseInt(mm, 10)} 月`;
      else if (lang === 'fr') monthYear = `${MONTHS_FR[monthIdx]} ${yyyy}`;
      else monthYear = `${MONTHS_EN[monthIdx]} ${yyyy}`;
      const pick = (en: string, zh: string, fr: string) =>
        lang === 'zh' ? zh : lang === 'fr' ? fr : en;
      const pickOptional = (en: string | undefined, zh: string | undefined, fr: string | undefined, def: {en:string;zh:string;fr:string}) =>
        lang === 'zh' ? (zh ?? def.zh) : lang === 'fr' ? (fr ?? def.fr) : (en ?? def.en);
      return {
        monthYear,
        intersection: pick(d.intersection_en, d.intersection_zh, d.intersection_fr),
        city: pick(d.city_en, d.city_zh, d.city_fr),
        rent: d.rent,
        period: lang === 'zh' ? '/ 月' : lang === 'fr' ? '/ mois' : '/ month',
        note: pick(d.note_en, d.note_zh, d.note_fr),
        status: pickOptional(d.status_en, d.status_zh, d.status_fr, {
          en: 'Represented Tenant', zh: '代表租客方', fr: 'Représente le locataire',
        }),
      };
    });
}
