require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mysql = require('mysql2/promise');

const samplePlans = [
  {
    name: "HealthGuard Individual", provider: "Star Health Insurance", type: "Individual",
    sumInsured: 500000, premium: { monthly: 1200, annual: 13500 }, ageRange: { min: 18, max: 65 },
    networkHospitals: 9900, cashlessHospitals: 7000, claimSettlementRatio: 94.5, renewalAge: 75,
    rating: 4.5, popular: true, recommended: true, status: "active",
    features: [
      { name: "Cashless Hospitalization", description: "Cashless treatment at 9900+ network hospitals", covered: true },
      { name: "Pre & Post Hospitalization", description: "60 days pre and 90 days post hospitalization", covered: true },
      { name: "Day Care Procedures", description: "All 541 day care procedures covered", covered: true },
      { name: "Ambulance Cover", description: "Emergency ambulance charges covered", covered: true }
    ],
    coverage: { hospitalization: true, daycare: true, prePostHospitalization: { days: 60, covered: true }, ambulance: true, roomRent: { limit: "No Limit", covered: true }, icu: true, surgery: true, maternity: false, dental: false, opd: false },
    waitingPeriods: { initial: 30, preExisting: 1095, specificDiseases: 730 },
    coPayment: { percentage: 0, applicable: false },
    subLimits: [{ category: "Room Rent", limit: "No Limit" }],
    addOns: [{ name: "Critical Illness Cover", description: "Coverage for 36 critical illnesses", premium: 2500 }, { name: "OPD Cover", description: "Outpatient department coverage", premium: 1800 }],
    benefits: [{ name: "No Claim Bonus", description: "5% increase in sum insured for every claim-free year" }, { name: "Free Health Checkup", description: "Annual health checkup after 4 claim-free years" }],
    exclusions: [{ category: "Cosmetic Surgery", description: "Cosmetic or aesthetic treatments not covered" }, { category: "Self-Inflicted Injuries", description: "Injuries due to self-harm not covered" }]
  },
  {
    name: "FamilyShield Floater", provider: "HDFC ERGO Health", type: "Family",
    sumInsured: 1000000, premium: { monthly: 2800, annual: 31500 }, ageRange: { min: 18, max: 65 },
    networkHospitals: 13000, cashlessHospitals: 10000, claimSettlementRatio: 96.2, renewalAge: 80,
    rating: 4.7, popular: true, recommended: true, status: "active",
    features: [
      { name: "Family Floater", description: "Single policy covering entire family", covered: true },
      { name: "Maternity Cover", description: "Maternity and newborn baby cover included", covered: true },
      { name: "Restore Benefit", description: "Sum insured automatically restored once exhausted", covered: true },
      { name: "Mental Health Cover", description: "In-patient mental health treatment covered", covered: true }
    ],
    coverage: { hospitalization: true, daycare: true, prePostHospitalization: { days: 90, covered: true }, ambulance: true, roomRent: { limit: "No Limit", covered: true }, icu: true, surgery: true, maternity: true, dental: false, opd: true },
    waitingPeriods: { initial: 30, preExisting: 730, specificDiseases: 730 },
    coPayment: { percentage: 0, applicable: false },
    subLimits: [{ category: "Maternity", limit: "50,000" }],
    addOns: [{ name: "Personal Accident Cover", description: "Accidental death and disability cover", premium: 3000 }, { name: "International Cover", description: "Emergency medical cover abroad", premium: 5000 }],
    benefits: [{ name: "Restore Benefit", description: "100% restoration of sum insured once per year" }, { name: "Wellness Program", description: "Access to wellness and preventive care programs" }],
    exclusions: [{ category: "Dental Treatment", description: "Routine dental procedures not covered" }, { category: "Vision Correction", description: "Spectacles and contact lenses not covered" }]
  },
  {
    name: "SeniorCare Plus", provider: "Niva Bupa Health Insurance", type: "Senior Citizen",
    sumInsured: 300000, premium: { monthly: 3500, annual: 39500 }, ageRange: { min: 60, max: 80 },
    networkHospitals: 8500, cashlessHospitals: 6000, claimSettlementRatio: 92.0, renewalAge: 99,
    rating: 4.2, popular: false, recommended: true, status: "active",
    features: [
      { name: "No Pre-Medical Test", description: "No medical tests required up to age 65", covered: true },
      { name: "Domiciliary Treatment", description: "Home treatment covered when hospitalization not possible", covered: true },
      { name: "AYUSH Treatment", description: "Ayurveda, Yoga, Unani, Siddha, Homeopathy covered", covered: true },
      { name: "Organ Donor Cover", description: "Organ donor medical expenses covered", covered: true }
    ],
    coverage: { hospitalization: true, daycare: true, prePostHospitalization: { days: 60, covered: true }, ambulance: true, roomRent: { limit: "Single AC Room", covered: true }, icu: true, surgery: true, maternity: false, dental: false, opd: false },
    waitingPeriods: { initial: 30, preExisting: 1095, specificDiseases: 730 },
    coPayment: { percentage: 20, applicable: true },
    subLimits: [{ category: "Cataract", limit: "25,000 per eye" }, { category: "Joint Replacement", limit: "1,50,000" }],
    addOns: [{ name: "Critical Illness Rider", description: "Lump sum on diagnosis of critical illness", premium: 4000 }],
    benefits: [{ name: "Lifetime Renewability", description: "Policy can be renewed for lifetime" }, { name: "Tax Benefit", description: "Premium eligible for tax deduction under Section 80D" }],
    exclusions: [{ category: "Pre-existing Diseases", description: "Pre-existing conditions covered after 3 years" }, { category: "Cosmetic Surgery", description: "Aesthetic treatments not covered" }]
  },
  {
    name: "CriticalCare Shield", provider: "ICICI Lombard Health", type: "Critical Illness",
    sumInsured: 2000000, premium: { monthly: 1800, annual: 20000 }, ageRange: { min: 18, max: 65 },
    networkHospitals: 6500, cashlessHospitals: 5000, claimSettlementRatio: 97.8, renewalAge: 75,
    rating: 4.6, popular: true, recommended: false, status: "active",
    features: [
      { name: "36 Critical Illnesses", description: "Covers 36 major critical illnesses including cancer, heart attack", covered: true },
      { name: "Lump Sum Payout", description: "100% lump sum on first diagnosis", covered: true },
      { name: "Income Replacement", description: "Monthly income benefit during recovery", covered: true },
      { name: "Second Opinion", description: "Free second medical opinion from specialists", covered: true }
    ],
    coverage: { hospitalization: true, daycare: false, prePostHospitalization: { days: 30, covered: true }, ambulance: true, roomRent: { limit: "No Limit", covered: true }, icu: true, surgery: true, maternity: false, dental: false, opd: false },
    waitingPeriods: { initial: 90, preExisting: 1095, specificDiseases: 1095 },
    coPayment: { percentage: 0, applicable: false },
    subLimits: [],
    addOns: [{ name: "Premium Waiver", description: "Future premiums waived on critical illness diagnosis", premium: 1200 }],
    benefits: [{ name: "Survival Benefit", description: "Lump sum paid on surviving 30 days after diagnosis" }, { name: "Portability", description: "Policy can be ported from other insurers" }],
    exclusions: [{ category: "Pre-existing Conditions", description: "Conditions existing before policy start not covered" }, { category: "Self-Inflicted", description: "Self-inflicted injuries excluded" }]
  },
  {
    name: "ComprehensiveCare 360", provider: "Bajaj Allianz Health", type: "Individual",
    sumInsured: 750000, premium: { monthly: 1650, annual: 18500 }, ageRange: { min: 18, max: 65 },
    networkHospitals: 11000, cashlessHospitals: 8500, claimSettlementRatio: 95.1, renewalAge: 75,
    rating: 4.4, popular: false, recommended: true, status: "active",
    features: [
      { name: "OPD Coverage", description: "Outpatient consultations and diagnostics covered", covered: true },
      { name: "Dental & Vision", description: "Dental treatment and vision correction covered", covered: true },
      { name: "Wellness Benefits", description: "Gym membership and wellness app access", covered: true },
      { name: "Teleconsultation", description: "Unlimited free doctor teleconsultations", covered: true }
    ],
    coverage: { hospitalization: true, daycare: true, prePostHospitalization: { days: 90, covered: true }, ambulance: true, roomRent: { limit: "No Limit", covered: true }, icu: true, surgery: true, maternity: false, dental: true, opd: true },
    waitingPeriods: { initial: 30, preExisting: 730, specificDiseases: 730 },
    coPayment: { percentage: 0, applicable: false },
    subLimits: [{ category: "OPD", limit: "15,000 per year" }, { category: "Dental", limit: "10,000 per year" }],
    addOns: [{ name: "Maternity Cover", description: "Maternity and newborn expenses", premium: 4500 }, { name: "Personal Accident", description: "Accidental death and disability", premium: 2000 }],
    benefits: [{ name: "No Claim Bonus", description: "10% increase in sum insured for every claim-free year up to 50%" }, { name: "Health Rewards", description: "Earn reward points for healthy lifestyle" }],
    exclusions: [{ category: "War Injuries", description: "Injuries due to war or nuclear activity" }, { category: "Substance Abuse", description: "Treatment for alcohol or drug abuse" }]
  },
  {
    name: "GroupHealth Pro", provider: "United India Insurance", type: "Group",
    sumInsured: 300000, premium: { monthly: 800, annual: 9000 }, ageRange: { min: 18, max: 60 },
    networkHospitals: 7000, cashlessHospitals: 5500, claimSettlementRatio: 91.5, renewalAge: 65,
    rating: 4.0, popular: false, recommended: false, status: "active",
    features: [
      { name: "Group Discount", description: "Special premium rates for groups of 10+", covered: true },
      { name: "Maternity Cover", description: "Maternity benefits included from day one", covered: true },
      { name: "Pre-existing Cover", description: "Pre-existing diseases covered from day one", covered: true },
      { name: "Dependent Cover", description: "Spouse and 2 children covered", covered: true }
    ],
    coverage: { hospitalization: true, daycare: true, prePostHospitalization: { days: 60, covered: true }, ambulance: true, roomRent: { limit: "Shared Room", covered: true }, icu: true, surgery: true, maternity: true, dental: false, opd: false },
    waitingPeriods: { initial: 0, preExisting: 0, specificDiseases: 0 },
    coPayment: { percentage: 10, applicable: true },
    subLimits: [{ category: "Maternity Normal", limit: "25,000" }, { category: "Maternity C-Section", limit: "40,000" }],
    addOns: [{ name: "Top-up Cover", description: "Additional coverage beyond base sum insured", premium: 1500 }],
    benefits: [{ name: "Floater Option", description: "Sum insured shared among all family members" }, { name: "Portability", description: "Individual policy on leaving the group" }],
    exclusions: [{ category: "Cosmetic Surgery", description: "Aesthetic and cosmetic procedures" }, { category: "Experimental Treatment", description: "Unproven or experimental treatments" }]
  }
];

const run = async () => {
  const dbName = process.env.MYSQL_DATABASE || 'livishield';

  const init = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
  });
  await init.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await init.end();

  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD,
    database: dbName,
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      phone VARCHAR(20) DEFAULT NULL,
      date_of_birth DATE DEFAULT NULL,
      address VARCHAR(500) DEFAULT NULL,
      role ENUM('customer','admin','agent') DEFAULT 'customer',
      is_verified TINYINT(1) DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS health_insurance_plans (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      name VARCHAR(255) NOT NULL,
      provider VARCHAR(255) NOT NULL,
      type ENUM('Individual','Family','Senior Citizen','Critical Illness','Group') NOT NULL,
      sum_insured INT NOT NULL,
      premium_monthly INT NOT NULL,
      premium_annual INT NOT NULL,
      age_min INT NOT NULL,
      age_max INT NOT NULL,
      network_hospitals INT NOT NULL,
      cashless_hospitals INT NOT NULL,
      claim_settlement_ratio DECIMAL(5,2) NOT NULL,
      renewal_age INT NOT NULL,
      rating DECIMAL(3,1) DEFAULT 4.0,
      popular TINYINT(1) DEFAULT 0,
      recommended TINYINT(1) DEFAULT 0,
      status ENUM('active','inactive','discontinued') DEFAULT 'active',
      features JSON,
      coverage JSON,
      waiting_periods JSON,
      copayment JSON,
      sub_limits JSON,
      add_ons JSON,
      benefits JSON,
      exclusions JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS health_insurance_proposals (
      id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
      proposal_number VARCHAR(50) UNIQUE NOT NULL,
      plan_id VARCHAR(36) NOT NULL,
      user_id VARCHAR(100) NOT NULL,
      status ENUM('submitted','under_review','documents_required','approved','rejected','cancelled') DEFAULT 'submitted',
      personal_info JSON,
      family_members JSON,
      medical_info JSON,
      selected_add_ons JSON,
      premium_details JSON,
      required_documents JSON,
      policy_details JSON,
      rejection_details JSON,
      assigned_agent JSON,
      status_history JSON,
      communications JSON,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  const [existing] = await conn.query('SELECT COUNT(*) as count FROM health_insurance_plans');
  if (existing[0].count === 0) {
    for (const plan of samplePlans) {
      await conn.query(
        `INSERT INTO health_insurance_plans
          (name,provider,type,sum_insured,premium_monthly,premium_annual,age_min,age_max,
           network_hospitals,cashless_hospitals,claim_settlement_ratio,renewal_age,rating,
           popular,recommended,status,features,coverage,waiting_periods,copayment,
           sub_limits,add_ons,benefits,exclusions)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          plan.name, plan.provider, plan.type, plan.sumInsured,
          plan.premium.monthly, plan.premium.annual,
          plan.ageRange.min, plan.ageRange.max,
          plan.networkHospitals, plan.cashlessHospitals,
          plan.claimSettlementRatio, plan.renewalAge, plan.rating,
          plan.popular ? 1 : 0, plan.recommended ? 1 : 0, plan.status,
          JSON.stringify(plan.features), JSON.stringify(plan.coverage),
          JSON.stringify(plan.waitingPeriods), JSON.stringify(plan.coPayment),
          JSON.stringify(plan.subLimits), JSON.stringify(plan.addOns),
          JSON.stringify(plan.benefits), JSON.stringify(plan.exclusions)
        ]
      );
    }
    console.log(`Seeded ${samplePlans.length} health insurance plans.`);
  }

  console.log('Migration complete.');
  await conn.end();
};

run().catch(err => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
