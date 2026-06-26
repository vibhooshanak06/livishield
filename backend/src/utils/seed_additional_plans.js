/**
 * seed_additional_plans.js
 * Adds 7 new unique health insurance plans to the existing 6.
 * Run: node src/utils/seed_additional_plans.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const { randomUUID } = require('crypto');

const J = (v) => JSON.stringify(v);

const PLANS = [
  // ─────────────────────────────────────────────────────────────────
  // PLAN 7 — MaternaCare Plus (Maternity-focused Individual plan)
  // ─────────────────────────────────────────────────────────────────
  {
    name: 'MaternaCare Plus',
    provider: 'Aditya Birla Health Insurance',
    type: 'Individual',
    sum_insured: 500000,
    premium_monthly: 2100,
    premium_annual: 23500,
    age_min: 18, age_max: 45,
    network_hospitals: 10000, cashless_hospitals: 8500,
    claim_settlement_ratio: 96.2, renewal_age: 55,
    rating: 4.5, popular: 1, recommended: 1, status: 'active',
    features: J([
      { name: 'Day-1 Maternity Cover', description: 'Normal & C-section delivery covered from policy start after 9-month waiting period' },
      { name: 'New-born Baby Cover', description: 'New-born covered from birth up to 90 days under mother\'s policy' },
      { name: 'Fertility Treatment', description: 'IVF and IUI covered up to ₹1 Lakh per lifetime' },
      { name: 'Gynaecology OPD', description: 'Unlimited specialist consultations at network hospitals' },
      { name: 'Pre-natal Tests', description: 'All scans, blood tests and pre-natal check-ups included' },
      { name: 'Post-natal Complications', description: 'Post-delivery complications covered for 60 days' },
    ]),
    coverage: J({
      inpatient: { covered: true },
      maternity: { covered: true, limit: '₹75,000 normal / ₹1,00,000 C-section' },
      newbornCover: { covered: true, days: 90 },
      opd: { covered: true, limit: '₹20,000/year' },
      daycare: { covered: true },
      ambulance: { covered: true, limit: '₹5,000/event' },
      preHospitalisation: { covered: true, days: 30 },
      postHospitalisation: { covered: true, days: 60 },
      mentalHealth: { covered: false },
    }),
    waiting_periods: J({ initial: 30, preExisting: 1095, specificDiseases: 730, maternity: 270 }),
    copayment: J({ applicable: false, percentage: 0 }),
    sub_limits: J([
      { item: 'Room Rent', limit: 'Single Private AC Room' },
      { item: 'ICU', limit: '2% of Sum Insured per day' },
      { item: 'Maternity Limit', limit: '₹1,00,000 per delivery' },
    ]),
    add_ons: J([
      { name: 'Twin Baby Cover', description: 'Enhanced new-born cover for twins', premium: 3500 },
      { name: 'IVF Upgrade', description: 'Extends fertility treatment cover to ₹2 Lakh', premium: 4000 },
      { name: 'Post-natal Physio', description: '10 physiotherapy sessions post-delivery', premium: 1500 },
    ]),
    benefits: J([
      { name: 'Zero Co-payment', description: 'No co-payment required on any covered expense' },
      { name: 'Sum Insured Restore', description: 'Full sum insured auto-restored once per policy year' },
      { name: 'Annual Health Check-up', description: 'Free annual gynaecology wellness check-up' },
    ]),
    exclusions: J([
      { category: 'Cosmetic Procedures', description: 'Cosmetic surgeries unrelated to maternity complications' },
      { category: 'Dental & Optical', description: 'Routine dental and vision treatments excluded' },
      { category: 'Self-inflicted Injury', description: 'Any intentional self-harm is excluded' },
    ]),
  },

  // ─────────────────────────────────────────────────────────────────
  // PLAN 8 — SuperTopUp Shield (Top-up plan with aggregate deductible)
  // ─────────────────────────────────────────────────────────────────
  {
    name: 'SuperTopUp Shield',
    provider: 'Oriental Insurance',
    type: 'Individual',
    sum_insured: 2000000,
    premium_monthly: 950,
    premium_annual: 10500,
    age_min: 18, age_max: 65,
    network_hospitals: 7500, cashless_hospitals: 6000,
    claim_settlement_ratio: 93.8, renewal_age: 70,
    rating: 4.2, popular: 0, recommended: 1, status: 'active',
    features: J([
      { name: 'Aggregate Deductible', description: 'Single ₹3 Lakh deductible applies once per policy year' },
      { name: '₹20 Lakh Extra Cover', description: 'Massive additional cover at industry-lowest premiums' },
      { name: 'No Medical Tests up to 55', description: 'No pre-policy health check required below age 55' },
      { name: 'No Room Rent Capping', description: 'Choose any room category without co-payment penalty' },
      { name: 'Portability Allowed', description: 'Transfer from existing policy; prior waiting periods credited' },
      { name: 'Family Discount', description: '15% premium discount when adding spouse/children' },
    ]),
    coverage: J({
      inpatient: { covered: true },
      daycare: { covered: true },
      ambulance: { covered: true, limit: '₹5,000/event' },
      preHospitalisation: { covered: true, days: 60 },
      postHospitalisation: { covered: true, days: 90 },
      organDonor: { covered: true },
      domiciliary: { covered: true, limit: '₹50,000/year' },
      mentalHealth: { covered: false },
    }),
    waiting_periods: J({ initial: 30, preExisting: 1095, specificDiseases: 730 }),
    copayment: J({ applicable: false, percentage: 0 }),
    sub_limits: J([
      { item: 'Room Rent', limit: 'No capping' },
      { item: 'Deductible', limit: '₹3,00,000 aggregate per policy year' },
    ]),
    add_ons: J([
      { name: 'Reduce Deductible to ₹1L', description: 'Lower activation threshold for frequent claimers', premium: 3500 },
      { name: 'OPD Rider', description: 'Outpatient treatment cover of ₹15,000/year', premium: 2200 },
      { name: 'International Emergency', description: 'Emergency hospitalisation abroad up to USD 10,000', premium: 4500 },
    ]),
    benefits: J([
      { name: 'Best Value Top-up', description: 'Highest sum insured per rupee of premium in the market' },
      { name: 'Boosts Employer Cover', description: 'Ideal supplement to corporate health insurance' },
      { name: 'Lifetime Renewability', description: 'Guaranteed renewal up to age 70' },
    ]),
    exclusions: J([
      { category: 'Below Deductible Claims', description: 'Claims below the ₹3 Lakh annual deductible are not payable' },
      { category: 'Cosmetic Surgery', description: 'All elective cosmetic procedures excluded' },
      { category: 'War & Nuclear Risk', description: 'Injury from war, terrorism or nuclear events excluded' },
    ]),
  },

  // ─────────────────────────────────────────────────────────────────
  // PLAN 9 — DiabetesCare 360 (Specialised chronic illness plan)
  // ─────────────────────────────────────────────────────────────────
  {
    name: 'DiabetesCare 360',
    provider: 'Niva Bupa Health Insurance',
    type: 'Individual',
    sum_insured: 500000,
    premium_monthly: 2750,
    premium_annual: 30800,
    age_min: 18, age_max: 65,
    network_hospitals: 9000, cashless_hospitals: 7800,
    claim_settlement_ratio: 96.5, renewal_age: 70,
    rating: 4.6, popular: 1, recommended: 1, status: 'active',
    features: J([
      { name: 'Zero Waiting for Diabetes', description: 'Type 1 & Type 2 diabetes complications covered from Day 1' },
      { name: 'HbA1c Monitoring', description: 'Quarterly HbA1c lab tests covered under OPD benefit' },
      { name: 'Insulin & Devices', description: 'Insulin, glucose strips and glucometer covered up to ₹20,000/yr' },
      { name: 'Unlimited Diabetologist OPD', description: 'Unlimited specialist consultations at network hospitals' },
      { name: 'Kidney & Eye Complications', description: 'Diabetic nephropathy and retinopathy fully covered' },
      { name: 'Wellness & Diet Coaching', description: 'Personalised health coach, diet and fitness plan included' },
    ]),
    coverage: J({
      inpatient: { covered: true },
      daycare: { covered: true },
      diabetes: { covered: true, waitingPeriod: 0 },
      kidneyDialysis: { covered: true },
      retinalLaser: { covered: true },
      footCare: { covered: true, limit: '₹10,000/year' },
      ambulance: { covered: true, limit: '₹5,000/event' },
      opd: { covered: true, limit: '₹30,000/year' },
    }),
    waiting_periods: J({ initial: 0, preExisting: 0, specificDiseases: 0 }),
    copayment: J({ applicable: true, percentage: 10 }),
    sub_limits: J([
      { item: 'Room Rent', limit: '1% of Sum Insured per day' },
      { item: 'Devices & Consumables', limit: '₹20,000/year' },
    ]),
    add_ons: J([
      { name: 'CGM Device Cover', description: 'Continuous Glucose Monitor hardware and monthly sensors', premium: 5000 },
      { name: 'Family Diabetes Cover', description: 'Extend day-1 cover to up to 2 diabetic family members', premium: 8500 },
      { name: 'International Second Opinion', description: 'Online consultation with international endocrinologist', premium: 2000 },
    ]),
    benefits: J([
      { name: 'Industry-first Zero Waiting', description: 'No waiting period for pre-existing diabetes unlike standard policies' },
      { name: 'Wellness Rewards', description: 'Premium discount for consistently healthy HbA1c readings' },
      { name: 'Dedicated Care Manager', description: 'Personal health manager for every policyholder' },
    ]),
    exclusions: J([
      { category: 'Self-inflicted Harm', description: 'Deliberate non-compliance with prescribed treatment' },
      { category: 'Experimental Treatments', description: 'Unproven or unapproved diabetes treatments' },
      { category: 'Cosmetic Procedures', description: 'Elective cosmetic procedures not related to diabetes' },
    ]),
  },

  // ─────────────────────────────────────────────────────────────────
  // PLAN 10 — MindWell Mental Health (Mental health specialist plan)
  // ─────────────────────────────────────────────────────────────────
  {
    name: 'MindWell Mental Health',
    provider: 'HDFC ERGO Health',
    type: 'Individual',
    sum_insured: 300000,
    premium_monthly: 1100,
    premium_annual: 12500,
    age_min: 18, age_max: 60,
    network_hospitals: 5000, cashless_hospitals: 4200,
    claim_settlement_ratio: 94.1, renewal_age: 65,
    rating: 4.3, popular: 0, recommended: 1, status: 'active',
    features: J([
      { name: 'Psychiatric Hospitalisation', description: 'In-patient psychiatric treatment covered at par with physical illness' },
      { name: '30 OPD Therapy Sessions', description: '30 psychologist/psychiatrist OPD sessions per year' },
      { name: 'Tele-mental Health', description: 'Unlimited teleconsultation with licensed therapists' },
      { name: 'Addiction Rehabilitation', description: 'De-addiction and rehabilitation covered up to 30 days/year' },
      { name: 'Stress & Burnout Cover', description: 'Anxiety disorder and burnout-related hospitalisation covered' },
      { name: 'Crisis Helpline', description: '24/7 crisis counselling helpline included' },
    ]),
    coverage: J({
      inpatient: { covered: true },
      psychiatricHospitalisation: { covered: true },
      therapyOPD: { covered: true, sessions: 30 },
      teleconsult: { covered: true },
      deAddiction: { covered: true, days: 30 },
      ambulance: { covered: true, limit: '₹3,000/event' },
      daycare: { covered: true },
      physicalIllness: { covered: true },
    }),
    waiting_periods: J({ initial: 30, preExisting: 730, specificDiseases: 365 }),
    copayment: J({ applicable: false, percentage: 0 }),
    sub_limits: J([
      { item: 'Room Rent', limit: 'General Ward' },
      { item: 'De-addiction Centre', limit: '₹50,000/year' },
    ]),
    add_ons: J([
      { name: 'Neuro-psychiatric Cover', description: 'Add cover for neurological disorders including epilepsy', premium: 3000 },
      { name: 'Family Therapy Sessions', description: '15 additional sessions for family counselling', premium: 2500 },
      { name: 'Workplace Wellness Program', description: 'Corporate stress management workshops for policyholder', premium: 1800 },
    ]),
    benefits: J([
      { name: 'First of Its Kind', description: 'India\'s first standalone mental health insurance plan' },
      { name: 'Zero Stigma Claims', description: 'Confidential claim process to protect policyholder privacy' },
      { name: 'Wellness App Access', description: 'Free access to mindfulness and meditation app for 1 year' },
    ]),
    exclusions: J([
      { category: 'Intellectual Disability', description: 'Congenital intellectual disabilities excluded' },
      { category: 'Self-inflicted Harm', description: 'Intentional self-injury or attempted suicide' },
      { category: 'Substance Abuse (Elective)', description: 'Recreational drug use outside prescribed treatment' },
    ]),
  },

  // ─────────────────────────────────────────────────────────────────
  // PLAN 11 — Elite Health Platinum (Super-premium comprehensive plan)
  // ─────────────────────────────────────────────────────────────────
  {
    name: 'Elite Health Platinum',
    provider: 'Bajaj Allianz Health',
    type: 'Individual',
    sum_insured: 5000000,
    premium_monthly: 5800,
    premium_annual: 65000,
    age_min: 18, age_max: 65,
    network_hospitals: 15000, cashless_hospitals: 12000,
    claim_settlement_ratio: 98.1, renewal_age: 80,
    rating: 4.8, popular: 1, recommended: 1, status: 'active',
    features: J([
      { name: '₹50 Lakh Cover', description: 'Highest sum insured for elite medical care anywhere in India' },
      { name: 'Global Emergency Cover', description: 'Emergency hospitalisation covered worldwide up to USD 50,000' },
      { name: 'Private Room Guaranteed', description: 'No room rent capping — full private suite covered' },
      { name: 'Air Ambulance', description: 'Air ambulance for critical transfer covered up to ₹5 Lakh' },
      { name: 'Unlimited OPD', description: 'No cap on specialist OPD visits at network hospitals' },
      { name: 'Annual Executive Health Check', description: 'Full body check-up package worth ₹15,000 every year' },
    ]),
    coverage: J({
      inpatient: { covered: true },
      daycare: { covered: true },
      opd: { covered: true, limit: 'Unlimited at network' },
      ambulance: { covered: true, limit: '₹5,000 ground / ₹5,00,000 air' },
      preHospitalisation: { covered: true, days: 60 },
      postHospitalisation: { covered: true, days: 180 },
      internationalEmergency: { covered: true, limit: 'USD 50,000' },
      mentalHealth: { covered: true, limit: '₹2,00,000/year' },
      organDonor: { covered: true },
      homeCare: { covered: true, limit: '₹1,00,000/year' },
    }),
    waiting_periods: J({ initial: 0, preExisting: 730, specificDiseases: 365 }),
    copayment: J({ applicable: false, percentage: 0 }),
    sub_limits: J([
      { item: 'Room Rent', limit: 'No capping — any room category' },
      { item: 'Air Ambulance', limit: '₹5,00,000 per event' },
      { item: 'International Emergency', limit: 'USD 50,000 per trip' },
    ]),
    add_ons: J([
      { name: 'Worldwide OPD Coverage', description: 'OPD consultations outside India covered up to ₹3 Lakh', premium: 12000 },
      { name: 'Personal Health Concierge', description: 'Dedicated health concierge for doctor appointments & second opinions', premium: 8000 },
      { name: 'Dental & Vision Premium', description: 'Dental implants and LASIK eye surgery covered up to ₹1 Lakh', premium: 9500 },
    ]),
    benefits: J([
      { name: 'Zero Waiting Period for Most Illnesses', description: 'Only 2-year waiting for pre-existing conditions' },
      { name: 'No Disease-wise Sub-limits', description: 'Full sum insured available for any single illness' },
      { name: 'Premium Waiver on Total Disability', description: 'Premiums waived if policyholder is permanently disabled' },
    ]),
    exclusions: J([
      { category: 'Experimental Treatment', description: 'Treatments not approved by IRDA or international medical bodies' },
      { category: 'Non-medical Expenses', description: 'Toiletries, food charges, and visitor charges' },
      { category: 'War & Nuclear Risk', description: 'Injuries from armed conflict or nuclear events' },
    ]),
  },

  // ─────────────────────────────────────────────────────────────────
  // PLAN 12 — SmartFamily Floater Plus (Enhanced family plan)
  // ─────────────────────────────────────────────────────────────────
  {
    name: 'SmartFamily Floater Plus',
    provider: 'ICICI Lombard Health',
    type: 'Family',
    sum_insured: 1500000,
    premium_monthly: 3800,
    premium_annual: 42500,
    age_min: 0, age_max: 65,
    network_hospitals: 11000, cashless_hospitals: 9500,
    claim_settlement_ratio: 97.2, renewal_age: 75,
    rating: 4.7, popular: 1, recommended: 1, status: 'active',
    features: J([
      { name: 'Cover Up to 6 Members', description: 'Self, spouse, up to 4 children (or parents) under one policy' },
      { name: 'Automatic Restoration 3x', description: 'Sum insured restored 3 times per year for different illnesses' },
      { name: 'No Sub-limits on Diseases', description: 'Full sum insured usable for any single illness per member' },
      { name: 'Preventive Care Package', description: '6 annual health check-ups for all covered members' },
      { name: 'New-born Cover Day 1', description: 'New-born automatically covered from birth, no additional premium for 90 days' },
      { name: 'Second Medical Opinion', description: 'Free digital second opinion from senior specialists for critical conditions' },
    ]),
    coverage: J({
      inpatient: { covered: true },
      daycare: { covered: true },
      maternity: { covered: true, limit: '₹50,000 per delivery' },
      newbornCover: { covered: true, days: 90 },
      ambulance: { covered: true, limit: '₹7,500/event' },
      preHospitalisation: { covered: true, days: 60 },
      postHospitalisation: { covered: true, days: 90 },
      organDonor: { covered: true },
      vaccination: { covered: true, limit: '₹5,000/member/year' },
      mentalHealth: { covered: true, limit: '₹1,00,000/year' },
    }),
    waiting_periods: J({ initial: 30, preExisting: 1095, specificDiseases: 730, maternity: 270 }),
    copayment: J({ applicable: false, percentage: 0 }),
    sub_limits: J([
      { item: 'Room Rent', limit: 'Single AC Room (no capping for ICU)' },
      { item: 'Maternity', limit: '₹50,000 per delivery, max 2 deliveries' },
      { item: 'Vaccination', limit: '₹5,000 per member per year' },
    ]),
    add_ons: J([
      { name: 'Critical Illness Rider', description: 'Lump sum ₹10 Lakh on diagnosis of 20 critical illnesses for 1 member', premium: 5500 },
      { name: 'Super Restore Unlimited', description: 'Unlimited sum insured restoration (upgrade from 3x)', premium: 4000 },
      { name: 'International Cover Rider', description: 'Adds emergency hospitalisation outside India for entire family', premium: 11000 },
    ]),
    benefits: J([
      { name: '3x Auto-Restore', description: 'Unique triple restoration ensures the family never runs out of cover' },
      { name: 'No Claim Bonus', description: '10% sum insured increase every claim-free year up to 50%' },
      { name: 'Cashless in 10 Minutes', description: 'Pre-authorisation issued within 10 minutes at network hospitals' },
    ]),
    exclusions: J([
      { category: 'Cosmetic Surgery', description: 'Non-reconstructive cosmetic and aesthetic procedures' },
      { category: 'Adventure Sports Injuries', description: 'Injuries sustained during extreme sports without add-on' },
      { category: 'Dental Routine', description: 'Routine dental check-ups and fillings (only accident injuries covered)' },
    ]),
  },

  // ─────────────────────────────────────────────────────────────────
  // PLAN 13 — YouthActive OPD Plan (OPD-first plan for young earners)
  // ─────────────────────────────────────────────────────────────────
  {
    name: 'YouthActive OPD Plan',
    provider: 'Star Health Insurance',
    type: 'Individual',
    sum_insured: 300000,
    premium_monthly: 780,
    premium_annual: 8700,
    age_min: 18, age_max: 35,
    network_hospitals: 13000, cashless_hospitals: 11000,
    claim_settlement_ratio: 95.4, renewal_age: 40,
    rating: 4.4, popular: 1, recommended: 0, status: 'active',
    features: J([
      { name: '₹30,000 Annual OPD Benefit', description: 'Covers doctor visits, diagnostics, pharmacy and physio under OPD' },
      { name: 'Unlimited Teleconsults', description: 'Talk to any doctor 24/7 via app — consultations unlimited' },
      { name: 'Gym & Fitness Reimbursement', description: 'Up to ₹5,000/year reimbursement on gym membership' },
      { name: 'Mental Health OPD', description: '10 therapy sessions per year included at no extra cost' },
      { name: 'Sports Injury Cover', description: 'Covers sports-related injuries including fractures from recreational sports' },
      { name: 'Dental & Vision OPD', description: 'Basic dental scaling and vision check-up covered once a year' },
    ]),
    coverage: J({
      inpatient: { covered: true },
      daycare: { covered: true },
      opd: { covered: true, limit: '₹30,000/year' },
      teleconsult: { covered: true },
      dental: { covered: true, limit: '₹3,000/year (routine)' },
      vision: { covered: true, limit: '₹2,000/year' },
      ambulance: { covered: true, limit: '₹3,000/event' },
      sportsInjury: { covered: true },
      mentalHealth: { covered: true, sessions: 10 },
      physiotherapy: { covered: true, sessions: 12 },
    }),
    waiting_periods: J({ initial: 0, preExisting: 1095, specificDiseases: 365 }),
    copayment: J({ applicable: false, percentage: 0 }),
    sub_limits: J([
      { item: 'OPD Annual Limit', limit: '₹30,000' },
      { item: 'Gym Reimbursement', limit: '₹5,000/year' },
      { item: 'Dental OPD', limit: '₹3,000/year' },
    ]),
    add_ons: J([
      { name: 'Adventure Sports Upgrade', description: 'Covers extreme sports like skydiving, bungee jumping, trekking', premium: 2500 },
      { name: 'International Travel Cover', description: 'Emergency medical cover during international travel up to 30 days', premium: 3000 },
      { name: 'Increase OPD to ₹60,000', description: 'Double the annual OPD benefit to ₹60,000', premium: 4200 },
    ]),
    benefits: J([
      { name: 'Lowest Premium for Youth', description: 'Designed specifically for 18–35 age group with relevant benefits' },
      { name: 'Zero Paperwork OPD Claims', description: 'OPD claims settled digitally via app within 2 hours' },
      { name: 'Wellness Credits', description: 'Earn credits for steps, sleep and preventive check-ups to reduce renewal premium' },
    ]),
    exclusions: J([
      { category: 'Pre-existing Conditions', description: '3-year waiting period applies for declared pre-existing illnesses' },
      { category: 'Cosmetic & Aesthetic', description: 'Cosmetic dental, LASIK without power correction, cosmetic surgery' },
      { category: 'Pregnancy-related', description: 'Maternity and pregnancy complications not covered in this plan' },
    ]),
  },
];

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.MYSQL_HOST     || 'localhost',
    port:     parseInt(process.env.MYSQL_PORT || '3306'),
    user:     process.env.MYSQL_USER     || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'livishield',
  });

  console.log('✓ Connected to MySQL');

  // Check current count
  const [[{ count }]] = await conn.query('SELECT COUNT(*) AS count FROM health_insurance_plans');
  console.log(`  Existing plans: ${count}`);

  let inserted = 0;
  for (const plan of PLANS) {
    // Avoid duplicate names
    const [[{ cnt }]] = await conn.query(
      'SELECT COUNT(*) AS cnt FROM health_insurance_plans WHERE name = ?',
      [plan.name]
    );
    if (cnt > 0) {
      console.log(`  ⚠  Skipped (already exists): ${plan.name}`);
      continue;
    }

    await conn.query(
      `INSERT INTO health_insurance_plans
        (id, name, provider, type, sum_insured,
         premium_monthly, premium_annual,
         age_min, age_max,
         network_hospitals, cashless_hospitals,
         claim_settlement_ratio, renewal_age,
         rating, popular, recommended, status,
         features, coverage, waiting_periods,
         copayment, sub_limits, add_ons,
         benefits, exclusions)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        randomUUID(),
        plan.name, plan.provider, plan.type, plan.sum_insured,
        plan.premium_monthly, plan.premium_annual,
        plan.age_min, plan.age_max,
        plan.network_hospitals, plan.cashless_hospitals,
        plan.claim_settlement_ratio, plan.renewal_age,
        plan.rating, plan.popular, plan.recommended, plan.status,
        plan.features, plan.coverage, plan.waiting_periods,
        plan.copayment, plan.sub_limits, plan.add_ons,
        plan.benefits, plan.exclusions,
      ]
    );
    console.log(`  ✓ Inserted: ${plan.name}`);
    inserted++;
  }

  const [[{ total }]] = await conn.query('SELECT COUNT(*) AS total FROM health_insurance_plans');
  console.log(`\n✅ Done — inserted ${inserted} new plans. Total plans in DB: ${total}`);
  await conn.end();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
