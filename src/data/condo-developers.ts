// GTA condo developer directory. Brief factual summaries only.
// Project data is intentionally empty — Peter to populate with verified records.
// URLs are best-guess; verify before launch.

export interface Project {
  name: string;
  address?: string;
  year?: string;
  status?: string;
}

export interface Developer {
  slug: string;
  name: string;
  summary: string;
  website?: string;
  headquarters?: string;
  founded?: string;
  projects: Project[];
}

export const developers: Developer[] = [
  { slug: 'tridel', name: 'Tridel', summary: 'One of Canada\'s largest condominium developers, family-operated and based in Toronto.', website: 'https://www.tridel.com', headquarters: 'Toronto', founded: '1934', projects: [] },
  { slug: 'daniels-corporation', name: 'Daniels Corporation', summary: 'Toronto urban developer known for mixed-use communities, including involvement in the Regent Park revitalization.', website: 'https://www.danielscorp.com', headquarters: 'Toronto', founded: '1983', projects: [] },
  { slug: 'great-gulf', name: 'Great Gulf', summary: 'Toronto-based developer of condos, master-planned communities, and commercial properties across the GTA and U.S.', website: 'https://www.greatgulf.com', headquarters: 'Toronto', founded: '1975', projects: [] },
  { slug: 'menkes-developments', name: 'Menkes Developments', summary: 'Toronto family-owned developer building condos, low-rise homes, and commercial real estate across the GTA.', website: 'https://www.menkes.com', headquarters: 'Toronto', founded: '1954', projects: [] },
  { slug: 'concord-adex', name: 'Concord Adex', summary: 'Vancouver-rooted developer with a major Toronto presence; the firm behind much of CityPlace.', website: 'https://www.concordadex.com', headquarters: 'Vancouver / Toronto', projects: [] },
  { slug: 'pemberton-group', name: 'Pemberton Group', summary: 'Toronto-based condominium developer with projects across the GTA.', website: 'https://www.pembertongroup.com', headquarters: 'Toronto', founded: '1968', projects: [] },
  { slug: 'mattamy-homes', name: 'Mattamy Homes', summary: 'North America\'s largest privately-owned homebuilder; significant low-rise and master-planned community presence in the GTA.', website: 'https://www.mattamyhomes.com', headquarters: 'Toronto', founded: '1978', projects: [] },
  { slug: 'lifetime-developments', name: 'Lifetime Developments', summary: 'Toronto-based condominium developer.', website: 'https://www.lifetimedevelopments.com', headquarters: 'Toronto', projects: [] },
  { slug: 'remington-group', name: 'The Remington Group', summary: 'Toronto family-owned developer of master-planned communities, condos, and commercial real estate.', website: 'https://www.remingtongroup.com', headquarters: 'Toronto', projects: [] },
  { slug: 'aspen-ridge-homes', name: 'Aspen Ridge Homes', summary: 'GTA homebuilder of low-rise homes and condominiums.', website: 'https://www.aspenridgehomes.com', headquarters: 'Toronto', projects: [] },
  { slug: 'tribute-communities', name: 'Tribute Communities', summary: 'GTA developer of single-family homes, townhomes, and condominiums.', website: 'https://www.tributecommunities.com', headquarters: 'Toronto', projects: [] },
  { slug: 'greenpark-group', name: 'Greenpark Group', summary: 'Long-established GTA homebuilder of low-rise homes and condos.', website: 'https://www.greenparkgroup.com', headquarters: 'Toronto', projects: [] },
  { slug: 'lindvest-properties', name: 'Lindvest Properties', summary: 'Toronto-based developer affiliated with the Tridel Group, building condominium and master-planned communities.', website: 'https://www.lindvest.com', headquarters: 'Toronto', projects: [] },
  { slug: 'camrost-felcorp', name: 'Camrost Felcorp', summary: 'Toronto luxury condominium developer.', website: 'https://www.camrostfelcorp.com', headquarters: 'Toronto', projects: [] },
  { slug: 'reserve-properties', name: 'Reserve Properties', summary: 'Toronto boutique developer of mid-rise condominiums and townhomes.', website: 'https://www.reserveproperties.ca', headquarters: 'Toronto', projects: [] },
  { slug: 'altree-developments', name: 'Altree Developments', summary: 'Toronto-based developer focused on mixed-use and residential projects.', website: 'https://www.altreedevelopments.com', headquarters: 'Toronto', projects: [] },
  { slug: 'centrecourt-developments', name: 'CentreCourt Developments', summary: 'Toronto developer focused on transit-connected high-rise condominiums.', website: 'https://www.centrecourt.com', headquarters: 'Toronto', projects: [] },
  { slug: 'slate-asset-management', name: 'Slate Asset Management', summary: 'Real estate investment and asset management firm headquartered in Toronto.', website: 'https://www.slateam.com', headquarters: 'Toronto', projects: [] },
  { slug: 'hazelview-properties', name: 'Hazelview Properties', summary: 'Toronto-based real estate investment management firm with a multi-residential portfolio.', website: 'https://www.hazelview.com', headquarters: 'Toronto', projects: [] },
  { slug: 'lamb-development-corp', name: 'Lamb Development Corp', summary: 'Toronto developer of high-design urban condominium projects.', website: 'https://www.lambdevcorp.com', headquarters: 'Toronto', projects: [] },
];
