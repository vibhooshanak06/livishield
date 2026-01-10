const mongoose = require('mongoose');
const HealthInsurancePlan = require('../models/HealthInsurancePlan');
const connectMongoDB = require('../config/mongodb');

const healthInsurancePlans = [
  {
    name: "Star Health Comprehensive",
    provider: "Star Health Insurance",
    type: "Individual",
    sumInsured: 500000,
    premium: { monthly: 1250, annual: 15000 },
    ageRange: { min: 18, max: 65 },
    features: [
      { name: "Cashless Treatment", description: "Available at 9000+ network hospitals", covered: true },
      { name: "Pre & Post Hospitalization", description: "60 days pre and 90 days post", covered: true },
      { name: "Day Care Procedures", description: "Over 150 procedures covered", covered: true },
      { name: "Ambulance Cover", description: "Up to ₹2000 per hospitalization", covered: true }
    ],
    coverage: {
      hospitalization: true, daycare: true,
      prePostHospitalization: { days: 90, covered: true },
      ambulance: true, roomRent: { limit: "No Limit", covered: true },
      icu: true, surgery: true, maternity: false, dental: false, opd: false
    },
    waitingPeriods: { initial: 30, preExisting: 1095, specificDiseases: 730 },
    networkHospitals: 9000, cashlessHospitals: 8500,
    claimSettlementRatio: 89.5, renewalAge: 75,
    coPayment: { percentage: 0, applicable: false },
    subLimits: [
      { category: "Cataract", limit: "₹40,000 per eye" },
      { category: "Knee Replacement", limit: "₹1,50,000 per knee" }
    ],
    addOns: [
      { name: "Critical Illness Cover", description: "Additional cover for 37 critical illnesses", premium: 3000 },
      { name: "Personal Accident", description: "Accidental death and disability cover", premium: 1500 }
    ],
    benefits: [
      { name: "No Room Rent Capping", description: "Choose any room category" },
      { name: "Automatic Restoration", description: "Sum insured restored after claim" }
    ],
    exclusions: [
      { category: "Cosmetic Surgery", description: "Unless medically necessary" },
      { category: "Dental Treatment", description: "Except due to accident" }
    ],
    rating: 4.2, popular: true, recommended: false, status: "active"
  }
];
// Add more plans to the array
healthInsurancePlans.push(
  {
    name: "HDFC ERGO Health Suraksha",
    provider: "HDFC ERGO General Insurance",
    type: "Family",
    sumInsured: 1000000,
    premium: { monthly: 2083, annual: 25000 },
    ageRange: { min: 18, max: 70 },
    features: [
      { name: "Family Floater", description: "Coverage for entire family under single sum insured", covered: true },
      { name: "Wellness Benefits", description: "Health check-ups and preventive care", covered: true },
      { name: "Telemedicine", description: "Online doctor consultations", covered: true },
      { name: "Global Coverage", description: "Emergency treatment abroad", covered: true }
    ],
    coverage: {
      hospitalization: true, daycare: true,
      prePostHospitalization: { days: 60, covered: true },
      ambulance: true, roomRent: { limit: "2% of Sum Insured", covered: true },
      icu: true, surgery: true, maternity: true, dental: true, opd: true
    },
    waitingPeriods: { initial: 30, preExisting: 1095, specificDiseases: 365 },
    networkHospitals: 10000, cashlessHospitals: 9500,
    claimSettlementRatio: 92.1, renewalAge: 80,
    coPayment: { percentage: 10, applicable: true },
    subLimits: [
      { category: "Maternity", limit: "₹50,000 per delivery" },
      { category: "OPD", limit: "₹10,000 per year" }
    ],
    addOns: [
      { name: "Maternity Cover", description: "Pregnancy and childbirth expenses", premium: 5000 },
      { name: "OPD Cover", description: "Outpatient department expenses", premium: 4000 }
    ],
    benefits: [
      { name: "No Claim Bonus", description: "5% increase in sum insured annually" },
      { name: "Second Medical Opinion", description: "Expert consultation for major treatments" }
    ],
    exclusions: [
      { category: "Pre-existing Diseases", description: "3-year waiting period applies" },
      { category: "Infertility Treatment", description: "Not covered under standard plan" }
    ],
    rating: 4.5, popular: true, recommended: true, status: "active"
  },

  {
    name: "Max Bupa Health Companion",
    provider: "Niva Bupa Health Insurance",
    type: "Individual",
    sumInsured: 300000,
    premium: { monthly: 833, annual: 10000 },
    ageRange: { min: 18, max: 60 },
    features: [
      { name: "Unlimited Restoration", description: "Sum insured restored unlimited times", covered: true },
      { name: "Home Care Treatment", description: "Treatment at home for certain conditions", covered: true },
      { name: "Mental Health Cover", description: "Psychiatric and psychological treatments", covered: true },
      { name: "Alternative Medicine", description: "AYUSH treatments covered", covered: true }
    ],
    coverage: {
      hospitalization: true, daycare: true,
      prePostHospitalization: { days: 30, covered: true },
      ambulance: true, roomRent: { limit: "1% of Sum Insured", covered: true },
      icu: true, surgery: true, maternity: false, dental: false, opd: false
    },
    waitingPeriods: { initial: 30, preExisting: 1095, specificDiseases: 730 },
    networkHospitals: 7000, cashlessHospitals: 6500,
    claimSettlementRatio: 85.3, renewalAge: 70,
    coPayment: { percentage: 20, applicable: true },
    subLimits: [
      { category: "Mental Health", limit: "₹50,000 per year" },
      { category: "AYUSH Treatment", limit: "₹25,000 per year" }
    ],
    addOns: [
      { name: "Super Top-up", description: "Additional coverage above deductible", premium: 2500 },
      { name: "Daily Cash", description: "₹1000 per day of hospitalization", premium: 1800 }
    ],
    benefits: [
      { name: "Unlimited Restoration", description: "Sum insured restored after every claim" },
      { name: "Home Care", description: "Treatment at home for eligible conditions" }
    ],
    exclusions: [
      { category: "Substance Abuse", description: "Alcohol and drug-related treatments" },
      { category: "Experimental Treatment", description: "Unproven medical procedures" }
    ],
    rating: 4.0, popular: false, recommended: false, status: "active"
  }
);
// Add more plans
healthInsurancePlans.push(
  {
    name: "ICICI Lombard Complete Health Insurance",
    provider: "ICICI Lombard General Insurance",
    type: "Family",
    sumInsured: 750000,
    premium: { monthly: 1875, annual: 22500 },
    ageRange: { min: 18, max: 75 },
    features: [
      { name: "Automatic Sum Insured Enhancement", description: "10% increase every claim-free year", covered: true },
      { name: "Worldwide Coverage", description: "Emergency treatment globally", covered: true },
      { name: "Organ Donor Cover", description: "Expenses for organ donation", covered: true },
      { name: "Vaccination Cover", description: "Preventive vaccination expenses", covered: true }
    ],
    coverage: {
      hospitalization: true, daycare: true,
      prePostHospitalization: { days: 60, covered: true },
      ambulance: true, roomRent: { limit: "No Limit", covered: true },
      icu: true, surgery: true, maternity: true, dental: true, opd: false
    },
    waitingPeriods: { initial: 30, preExisting: 1095, specificDiseases: 365 },
    networkHospitals: 8500, cashlessHospitals: 8000,
    claimSettlementRatio: 91.8, renewalAge: 85,
    coPayment: { percentage: 0, applicable: false },
    subLimits: [
      { category: "Maternity", limit: "₹75,000 per delivery" },
      { category: "Dental", limit: "₹20,000 per year" }
    ],
    addOns: [
      { name: "International Coverage", description: "Worldwide emergency treatment", premium: 6000 },
      { name: "Consumables Cover", description: "Medical consumables during hospitalization", premium: 3500 }
    ],
    benefits: [
      { name: "Sum Insured Enhancement", description: "Automatic increase without medical tests" },
      { name: "Organ Donor Cover", description: "Support for organ donation expenses" }
    ],
    exclusions: [
      { category: "War and Nuclear Risks", description: "Injuries due to war or nuclear activity" },
      { category: "Self-inflicted Injuries", description: "Intentional self-harm not covered" }
    ],
    rating: 4.4, popular: true, recommended: true, status: "active"
  },

  {
    name: "Bajaj Allianz Health Guard",
    provider: "Bajaj Allianz General Insurance",
    type: "Senior Citizen",
    sumInsured: 400000,
    premium: { monthly: 2500, annual: 30000 },
    ageRange: { min: 60, max: 80 },
    features: [
      { name: "Senior Citizen Friendly", description: "Designed specifically for seniors", covered: true },
      { name: "Domiciliary Treatment", description: "Treatment at home when hospitalization not possible", covered: true },
      { name: "Health Check-up", description: "Annual preventive health check-up", covered: true },
      { name: "Ayurveda Coverage", description: "Traditional medicine treatments", covered: true }
    ],
    coverage: {
      hospitalization: true, daycare: true,
      prePostHospitalization: { days: 60, covered: true },
      ambulance: true, roomRent: { limit: "1% of Sum Insured", covered: true },
      icu: true, surgery: true, maternity: false, dental: true, opd: true
    },
    waitingPeriods: { initial: 30, preExisting: 730, specificDiseases: 365 },
    networkHospitals: 6500, cashlessHospitals: 6000,
    claimSettlementRatio: 87.2, renewalAge: 90,
    coPayment: { percentage: 20, applicable: true },
    subLimits: [
      { category: "OPD", limit: "₹15,000 per year" },
      { category: "Health Check-up", limit: "₹5,000 per year" }
    ],
    addOns: [
      { name: "Domiciliary Care", description: "Extended home treatment coverage", premium: 4000 },
      { name: "Ambulance Plus", description: "Enhanced ambulance coverage", premium: 1200 }
    ],
    benefits: [
      { name: "Reduced Waiting Period", description: "Shorter waiting for pre-existing conditions" },
      { name: "Domiciliary Treatment", description: "Home treatment when hospitalization not feasible" }
    ],
    exclusions: [
      { category: "Alzheimer's Disease", description: "Degenerative brain conditions excluded" },
      { category: "Congenital Disorders", description: "Birth defects not covered" }
    ],
    rating: 4.1, popular: false, recommended: true, status: "active"
  }
);
// Add remaining plans
healthInsurancePlans.push(
  {
    name: "Care Supreme Health Insurance",
    provider: "Care Health Insurance",
    type: "Individual",
    sumInsured: 600000,
    premium: { monthly: 1500, annual: 18000 },
    ageRange: { min: 18, max: 65 },
    features: [
      { name: "Unlimited Sum Insured Restoration", description: "Restore sum insured multiple times", covered: true },
      { name: "Care 24/7", description: "Round-the-clock customer support", covered: true },
      { name: "Wellness Program", description: "Fitness and wellness rewards", covered: true },
      { name: "Second Opinion", description: "Expert medical opinion service", covered: true }
    ],
    coverage: {
      hospitalization: true, daycare: true,
      prePostHospitalization: { days: 30, covered: true },
      ambulance: true, roomRent: { limit: "No Limit", covered: true },
      icu: true, surgery: true, maternity: false, dental: false, opd: false
    },
    waitingPeriods: { initial: 30, preExisting: 1095, specificDiseases: 730 },
    networkHospitals: 7500, cashlessHospitals: 7000,
    claimSettlementRatio: 88.7, renewalAge: 75,
    coPayment: { percentage: 0, applicable: false },
    subLimits: [
      { category: "Modern Treatment", limit: "50% of Sum Insured" },
      { category: "Mental Health", limit: "₹1,00,000 per year" }
    ],
    addOns: [
      { name: "Care Freedom", description: "Additional benefits and flexibility", premium: 3000 },
      { name: "Care Protect", description: "Enhanced critical illness cover", premium: 4500 }
    ],
    benefits: [
      { name: "Unlimited Restoration", description: "Sum insured restored unlimited times per year" },
      { name: "Wellness Rewards", description: "Discounts for healthy lifestyle" }
    ],
    exclusions: [
      { category: "Adventure Sports", description: "High-risk sports injuries" },
      { category: "Plastic Surgery", description: "Cosmetic procedures not covered" }
    ],
    rating: 4.3, popular: true, recommended: false, status: "active"
  },

  {
    name: "Religare Health Insurance",
    provider: "Religare Health Insurance",
    type: "Critical Illness",
    sumInsured: 1000000,
    premium: { monthly: 2917, annual: 35000 },
    ageRange: { min: 18, max: 65 },
    features: [
      { name: "Critical Illness Cover", description: "Coverage for 37 critical illnesses", covered: true },
      { name: "Lump Sum Benefit", description: "One-time payment on diagnosis", covered: true },
      { name: "Survival Benefit", description: "Additional benefit after survival period", covered: true },
      { name: "Premium Waiver", description: "No premium after critical illness diagnosis", covered: true }
    ],
    coverage: {
      hospitalization: true, daycare: true,
      prePostHospitalization: { days: 60, covered: true },
      ambulance: true, roomRent: { limit: "No Limit", covered: true },
      icu: true, surgery: true, maternity: false, dental: false, opd: false
    },
    waitingPeriods: { initial: 90, preExisting: 1095, specificDiseases: 730 },
    networkHospitals: 5500, cashlessHospitals: 5000,
    claimSettlementRatio: 84.5, renewalAge: 70,
    coPayment: { percentage: 0, applicable: false },
    subLimits: [
      { category: "Critical Illness", limit: "100% of Sum Insured" },
      { category: "Survival Benefit", limit: "25% of Sum Insured" }
    ],
    addOns: [
      { name: "Additional Critical Illness", description: "Cover for more critical conditions", premium: 5000 },
      { name: "Income Protection", description: "Monthly income during treatment", premium: 8000 }
    ],
    benefits: [
      { name: "Lump Sum Payment", description: "Immediate payment on diagnosis" },
      { name: "Premium Waiver", description: "No future premiums after claim" }
    ],
    exclusions: [
      { category: "Pre-existing Critical Illness", description: "Known conditions before policy start" },
      { category: "Genetic Disorders", description: "Hereditary critical conditions" }
    ],
    rating: 4.0, popular: false, recommended: true, status: "active"
  }
);
// Add final plans
healthInsurancePlans.push(
  {
    name: "Oriental Insurance Hope",
    provider: "The Oriental Insurance Company",
    type: "Family",
    sumInsured: 500000,
    premium: { monthly: 1042, annual: 12500 },
    ageRange: { min: 18, max: 70 },
    features: [
      { name: "Affordable Premium", description: "Budget-friendly family health insurance", covered: true },
      { name: "Cumulative Bonus", description: "Increase in sum insured for claim-free years", covered: true },
      { name: "Cashless Facility", description: "Hassle-free cashless treatment", covered: true },
      { name: "Pre-existing Disease Cover", description: "Coverage after waiting period", covered: true }
    ],
    coverage: {
      hospitalization: true, daycare: true,
      prePostHospitalization: { days: 30, covered: true },
      ambulance: true, roomRent: { limit: "1% of Sum Insured", covered: true },
      icu: true, surgery: true, maternity: false, dental: false, opd: false
    },
    waitingPeriods: { initial: 30, preExisting: 1095, specificDiseases: 730 },
    networkHospitals: 4000, cashlessHospitals: 3500,
    claimSettlementRatio: 82.1, renewalAge: 75,
    coPayment: { percentage: 10, applicable: true },
    subLimits: [
      { category: "Room Rent", limit: "₹5,000 per day" },
      { category: "ICU", limit: "₹10,000 per day" }
    ],
    addOns: [
      { name: "Personal Accident", description: "Accidental death and disability", premium: 1000 },
      { name: "Hospital Daily Cash", description: "Daily allowance during hospitalization", premium: 1500 }
    ],
    benefits: [
      { name: "Cumulative Bonus", description: "5% increase in sum insured annually" },
      { name: "Affordable Premium", description: "Cost-effective family coverage" }
    ],
    exclusions: [
      { category: "Cosmetic Treatment", description: "Beauty enhancement procedures" },
      { category: "Dental Care", description: "Routine dental treatments" }
    ],
    rating: 3.8, popular: false, recommended: false, status: "active"
  },

  {
    name: "United India Health Insurance",
    provider: "United India Insurance Company",
    type: "Group",
    sumInsured: 300000,
    premium: { monthly: 625, annual: 7500 },
    ageRange: { min: 18, max: 65 },
    features: [
      { name: "Group Coverage", description: "Employer-sponsored health insurance", covered: true },
      { name: "No Medical Examination", description: "Coverage without health check-up", covered: true },
      { name: "Immediate Coverage", description: "No waiting period for accidents", covered: true },
      { name: "Portability", description: "Easy transfer between employers", covered: true }
    ],
    coverage: {
      hospitalization: true, daycare: true,
      prePostHospitalization: { days: 30, covered: true },
      ambulance: true, roomRent: { limit: "₹3,000 per day", covered: true },
      icu: true, surgery: true, maternity: true, dental: false, opd: false
    },
    waitingPeriods: { initial: 30, preExisting: 1095, specificDiseases: 365 },
    networkHospitals: 3500, cashlessHospitals: 3000,
    claimSettlementRatio: 79.3, renewalAge: 70,
    coPayment: { percentage: 20, applicable: true },
    subLimits: [
      { category: "Maternity", limit: "₹30,000 per delivery" },
      { category: "Pre-existing Disease", limit: "50% of Sum Insured" }
    ],
    addOns: [
      { name: "Top-up Cover", description: "Additional coverage above base limit", premium: 2000 },
      { name: "Dependent Coverage", description: "Extended family member coverage", premium: 3000 }
    ],
    benefits: [
      { name: "Group Benefits", description: "Lower premium due to group coverage" },
      { name: "No Medical Tests", description: "Coverage without health examination" }
    ],
    exclusions: [
      { category: "Pre-existing Conditions", description: "3-year waiting period" },
      { category: "Infertility Treatment", description: "Fertility-related expenses" }
    ],
    rating: 3.5, popular: false, recommended: false, status: "active"
  },

  {
    name: "Aditya Birla Activ Health Platinum",
    provider: "Aditya Birla Health Insurance",
    type: "Individual",
    sumInsured: 1000000,
    premium: { monthly: 2500, annual: 30000 },
    ageRange: { min: 18, max: 65 },
    features: [
      { name: "Activ Health App", description: "Digital health management platform", covered: true },
      { name: "Wellness Rewards", description: "Rewards for healthy lifestyle choices", covered: true },
      { name: "Unlimited Teleconsultation", description: "Free online doctor consultations", covered: true },
      { name: "Global Coverage", description: "Worldwide emergency treatment", covered: true }
    ],
    coverage: {
      hospitalization: true, daycare: true,
      prePostHospitalization: { days: 60, covered: true },
      ambulance: true, roomRent: { limit: "No Limit", covered: true },
      icu: true, surgery: true, maternity: true, dental: true, opd: true
    },
    waitingPeriods: { initial: 30, preExisting: 1095, specificDiseases: 365 },
    networkHospitals: 6500, cashlessHospitals: 6000,
    claimSettlementRatio: 90.2, renewalAge: 80,
    coPayment: { percentage: 0, applicable: false },
    subLimits: [
      { category: "OPD", limit: "₹25,000 per year" },
      { category: "Maternity", limit: "₹1,00,000 per delivery" }
    ],
    addOns: [
      { name: "Activ Secure", description: "Enhanced critical illness coverage", premium: 7000 },
      { name: "Activ Care", description: "Comprehensive wellness program", premium: 4000 }
    ],
    benefits: [
      { name: "Digital Health Platform", description: "Complete health management through app" },
      { name: "Wellness Rewards", description: "Earn rewards for healthy activities" }
    ],
    exclusions: [
      { category: "Substance Abuse", description: "Drug and alcohol-related conditions" },
      { category: "Experimental Treatments", description: "Unproven medical procedures" }
    ],
    rating: 4.6, popular: true, recommended: true, status: "active"
  }
);

const seedHealthInsurancePlans = async () => {
  try {
    await connectMongoDB();
    console.log('Connected to MongoDB');

    // Clear existing plans
    await HealthInsurancePlan.deleteMany({});
    console.log('Cleared existing health insurance plans');

    // Insert new plans
    const insertedPlans = await HealthInsurancePlan.insertMany(healthInsurancePlans);
    console.log(`Successfully inserted ${insertedPlans.length} health insurance plans`);

    console.log('Health Insurance Plans seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding health insurance plans:', error);
    process.exit(1);
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedHealthInsurancePlans();
}

module.exports = { seedHealthInsurancePlans, healthInsurancePlans };