export interface InsuranceCompany {
  id: string;
  name: string;
  logo: string;
  color: string;
  website: string;
  prices: {
    months1: number;
    months3: number;
    months6: number;
    months9: number;
    months12: number;
  };
  features: string[];
  isBestOffer?: boolean;
}

export const insuranceCompanies: InsuranceCompany[] = [
  {
    id: 'balta',
    name: 'BALTA',
    logo: require('@/assets/Balta-Logo.png'),
    color: '#FF6B35',
    website: 'https://balta.lv',
    prices: {
      months1: 54.03,
      months3: 162.10,
      months6: 422.67,
      months9: 619.92,
      months12: 1628.06
    },
    features: ['24/7 support', 'Fast claims', 'EU coverage']
  },
  {
    id: 'compensa',
    name: 'COMPENSA',
    logo: require('@/assets/Compensa -logo.png'),
    color: '#4CAF50',
    website: 'https://compensa.lv',
    prices: {
      months1: 104.32,
      months3: 312.95,
      months6: 740.88,
      months9: 1576.11,
      months12: 2865.88
    },
    features: ['Premium service', 'Roadside assistance', 'Digital policy']
  },
  {
    id: 'ergo',
    name: 'ERGO',
    logo: require('@/assets/ERGO-LOGO.png'),
    color: '#E91E63',
    website: 'https://ergo.lv',
    prices: {
      months1: 84.69,
      months3: 254.08,
      months6: 621.66,
      months9: 983.46,
      months12: 1893.18
    },
    features: ['Quick processing', 'Mobile app', 'Expert support']
  },
  {
    id: 'gjensidige',
    name: 'Gjensidige',
    logo: require('@/assets/Gjensidige-logo.png'),
    color: '#1B2951',
    website: 'https://gjensidige.lv',
    prices: {
      months1: 60.70,
      months3: 182.10,
      months6: 422.67,
      months9: 819.92,
      months12: 1628.06
    },
    features: ['Nordic reliability', 'Green insurance', 'Customer care']
  },
  {
    id: 'bta',
    name: 'BTA',
    logo: require('@/assets/BTA-logo.png'),
    color: '#FF9800',
    website: 'https://bta.lv',
    prices: {
      months1: 76.23,
      months3: 228.69,
      months6: 576.79,
      months9: 1044.40,
      months12: 2023.82
    },
    features: ['Local expertise', 'Flexible terms', 'Quick claims']
  },
  {
    id: 'if',
    name: 'If P&C Insurance',
    logo: require('@/assets/IF-logo_20.png'),
    color: '#0066CC',
    website: 'https://if.lv',
    prices: {
      months1: 68.45,
      months3: 205.35,
      months6: 498.90,
      months9: 892.15,
      months12: 1756.32
    },
    features: ['Scandinavian quality', 'Digital services', 'Fast claims']
  },
  {
    id: 'balcia',
    name: 'BALCIA',
    logo: require('@/assets/BALCIA-LOGO.png'),
    color: '#1E3A8A',
    website: 'https://balcia.lv',
    prices: {
      months1: 59.80,
      months3: 179.40,
      months6: 434.20,
      months9: 776.80,
      months12: 1528.90
    },
    features: ['OCTA specialist', 'KASKO insurance', 'Local expertise']
  },



  {
    id: 'ban',
    name: 'Baltijas Apdrošināšanas Nams',
    logo: require('@/assets/BAN-LOGO.png'),
    color: '#FF6B35',
    website: 'https://ban.lv',
    prices: {
      months1: 58.90,
      months3: 176.70,
      months6: 428.45,
      months9: 765.23,
      months12: 1512.78
    },
    features: ['Baltic expertise', 'Local market knowledge', 'Comprehensive coverage']
  },


];

export const calculateInsurancePrices = (
  carYear: number, 
  carNumber: string, 
  selectedPeriod: keyof InsuranceCompany['prices'] = 'months12',
  customerType: 'personal' | 'company' = 'personal'
): InsuranceCompany[] => {
  const currentYear = new Date().getFullYear();
  const carAge = currentYear - carYear;
  
  let multiplier = 1.0;
  if (carAge <= 4) multiplier = 0.9;
  else if (carAge <= 9) multiplier = 1.0;
  else if (carAge <= 14) multiplier = 1.2;
  else multiplier = 1.4;
  
  // Apply customer type multiplier
  const customerMultiplier = customerType === 'company' ? 1.15 : 1.0; // Companies pay 15% more
  const finalMultiplier = multiplier * customerMultiplier;
  
  // Calculate prices with multiplier
  const companiesWithPrices = insuranceCompanies.map(company => ({
    ...company,
    prices: {
      months1: Math.round(company.prices.months1 * finalMultiplier * 100) / 100,
      months3: Math.round(company.prices.months3 * finalMultiplier * 100) / 100,
      months6: Math.round(company.prices.months6 * finalMultiplier * 100) / 100,
      months9: Math.round(company.prices.months9 * finalMultiplier * 100) / 100,
      months12: Math.round(company.prices.months12 * finalMultiplier * 100) / 100,
    },
    isBestOffer: false // Reset best offer flag
  }));
  
  // Find the lowest price for the selected period
  const lowestPrice = Math.min(...companiesWithPrices.map(company => company.prices[selectedPeriod]));
  
  // Mark companies with lowest price as best offer and sort by price (lowest first)
  return companiesWithPrices
    .map(company => ({
      ...company,
      isBestOffer: company.prices[selectedPeriod] === lowestPrice
    }))
    .sort((a, b) => a.prices[selectedPeriod] - b.prices[selectedPeriod]);
};
