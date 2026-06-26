import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft, ArrowRight, User, Users, Heart, DollarSign,
  CheckCircle, AlertCircle, Star, MapPin, Shield
} from 'lucide-react';
import healthInsuranceService from '../services/healthInsuranceService';
import '../styles/theme.css';

/* ── helpers ── */
const ic = (err) =>
  `w-full p-2.5 border rounded-lg text-sm focus:ring-2 livishield-focus-ring focus:border-transparent ${
    err ? 'border-red-500 bg-red-50' : 'border-gray-300'
  }`;

const Field = ({ label, error, required, children }) => (
  <div className="mb-3">
    <label className="block text-xs font-medium mb-1 text-gray-600">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
        <AlertCircle className="h-3 w-3 shrink-0" />{error}
      </p>
    )}
  </div>
);

/* step definitions */
const STEPS = [
  { id: 'personal',  label: 'Personal',  icon: User },
  { id: 'address',   label: 'Address',   icon: MapPin },
  { id: 'medical',   label: 'Medical',   icon: Heart },
  { id: 'addons',    label: 'Add-ons',   icon: DollarSign },
  { id: 'review',    label: 'Review',    icon: CheckCircle },
];

const CONDITIONS = ['None','Diabetes','Hypertension','Heart Disease','Asthma','Thyroid','Kidney Disease','Cancer','Other'];

/* ── Progress Bar ── */
const StepProgress = ({ steps, current }) => (
  <div className="flex items-center w-full">
    {steps.map((step, idx) => {
      const done = idx < current;
      const active = idx === current;
      const Icon = step.icon;
      return (
        <div key={step.id} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
              done    ? 'livishield-bg-accent border-transparent text-white' :
              active  ? 'border-blue-500 livishield-text-accent bg-blue-50' :
                        'border-gray-300 text-gray-400 bg-white'
            }`}>
              {done ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
            <span className={`text-xs mt-1 font-medium whitespace-nowrap ${
              active ? 'livishield-text-accent' : done ? 'text-gray-600' : 'text-gray-400'
            }`}>{step.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all duration-300 ${done ? 'livishield-bg-accent' : 'bg-gray-200'}`} />
          )}
        </div>
      );
    })}
  </div>
);

/* ── Main Component ── */
const HealthInsuranceQuote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [step, setStep]     = useState(0);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', gender: '',
    address: '', city: '', state: '', pincode: '',
    familyMembers: [],
    preExistingConditions: [], currentMedications: '',
    previousInsurance: false, previousInsuranceDetails: '',
    preferredHospitals: '', additionalRequirements: '',
    selectedAddOns: []
  });

  const [familyMember, setFamilyMember] = useState({ name: '', relationship: '', dateOfBirth: '', gender: '' });

  useEffect(() => {
    (async () => {
      try {
        const data = await healthInsuranceService.getPlanById(id);
        setPlan(data);
      } catch {
        setFetchError('Failed to load plan details.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const set = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  /* per-step validation */
  const validateStep = useCallback((s) => {
    const e = {};
    if (s === 0) {
      if (!formData.firstName.trim()) e.firstName = 'Required';
      if (!formData.lastName.trim())  e.lastName  = 'Required';
      if (!formData.email.trim()) e.email = 'Required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Invalid email';
      if (!formData.phone.trim()) e.phone = 'Required';
      else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g,''))) e.phone = 'Enter valid 10-digit number';
      if (!formData.dateOfBirth) e.dateOfBirth = 'Required';
      else {
        const age = new Date().getFullYear() - new Date(formData.dateOfBirth).getFullYear();
        if (age < 18) e.dateOfBirth = 'Must be at least 18';
        if (age > 80) e.dateOfBirth = 'Max age is 80';
      }
      if (!formData.gender) e.gender = 'Required';
    }
    if (s === 1) {
      if (!formData.address.trim()) e.address = 'Required';
      if (!formData.city.trim())    e.city    = 'Required';
      if (!formData.state.trim())   e.state   = 'Required';
      if (!formData.pincode.trim()) e.pincode = 'Required';
      else if (!/^\d{6}$/.test(formData.pincode)) e.pincode = 'Enter valid 6-digit PIN';
    }
    if (s === 2) {
      if (formData.preExistingConditions.length === 0) e.preExistingConditions = 'Please select at least one option';
      if (formData.previousInsurance && !formData.previousInsuranceDetails.trim())
        e.previousInsuranceDetails = 'Please provide details';
    }
    return e;
  }, [formData]);

  const next = useCallback(() => {
    // skip addons step if plan has no addons
    const effectiveSteps = plan?.addOns?.length ? STEPS : STEPS.filter(s => s.id !== 'addons');
    const maxStep = effectiveSteps.length - 1;
    const e = validateStep(step);
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(s => Math.min(s + 1, maxStep));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, validateStep, plan]);

  const back = useCallback(() => {
    setErrors({});
    setStep(s => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const addFamilyMember = useCallback(() => {
    const e = {};
    if (!familyMember.name.trim())    e.fm_name = 'Required';
    if (!familyMember.relationship)   e.fm_rel  = 'Required';
    if (!familyMember.dateOfBirth)    e.fm_dob  = 'Required';
    if (!familyMember.gender)         e.fm_gen  = 'Required';
    if (Object.keys(e).length) { setErrors(prev => ({ ...prev, ...e })); return; }
    setFormData(prev => ({ ...prev, familyMembers: [...prev.familyMembers, { ...familyMember, id: Date.now() }] }));
    setFamilyMember({ name: '', relationship: '', dateOfBirth: '', gender: '' });
    setErrors(prev => { const n = { ...prev }; ['fm_name','fm_rel','fm_dob','fm_gen'].forEach(k => delete n[k]); return n; });
  }, [familyMember]);

  const removeFamilyMember = useCallback((mid) =>
    setFormData(prev => ({ ...prev, familyMembers: prev.familyMembers.filter(m => m.id !== mid) })), []);

  const toggleAddOn = useCallback((addon) =>
    setFormData(prev => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.find(a => a.name === addon.name)
        ? prev.selectedAddOns.filter(a => a.name !== addon.name)
        : [...prev.selectedAddOns, addon]
    })), []);

  const calcTotal = useCallback(() => {
    if (!plan) return 0;
    const addOnPremium = formData.selectedAddOns.reduce((s, a) => s + a.premium, 0);
    const fm = plan.type === 'Family' && formData.familyMembers.length > 0
      ? 1 + formData.familyMembers.length * 0.3 : 1;
    return Math.round(plan.premium.annual * fm + addOnPremium);
  }, [plan, formData.selectedAddOns, formData.familyMembers]);

  const submitProposal = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const total = calcTotal();
      const body = {
        planId: id,
        personalInfo: {
          firstName: formData.firstName, lastName: formData.lastName,
          email: formData.email, phone: formData.phone,
          dateOfBirth: formData.dateOfBirth, gender: formData.gender,
          address: { street: formData.address, city: formData.city, state: formData.state, pincode: formData.pincode }
        },
        familyMembers: formData.familyMembers,
        medicalInfo: {
          preExistingConditions: formData.preExistingConditions,
          currentMedications: formData.currentMedications,
          previousInsurance: formData.previousInsurance,
          previousInsuranceDetails: formData.previousInsuranceDetails,
          preferredHospitals: formData.preferredHospitals,
          additionalRequirements: formData.additionalRequirements
        },
        selectedAddOns: formData.selectedAddOns,
        premiumDetails: {
          basePremium: plan.premium.annual,
          addOnPremium: formData.selectedAddOns.reduce((s, a) => s + a.premium, 0),
          familyPremium: formData.familyMembers.length * plan.premium.annual * 0.3,
          totalAnnualPremium: total,
          totalMonthlyPremium: Math.round(total / 12)
        }
      };
      const token = localStorage.getItem('liveshield_token');
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/proposals/submit`, {
        method: 'POST', headers, body: JSON.stringify(body)
      });
      const result = await res.json();
      if (result.success) {
        navigate('/health-insurance/proposal-success', {
          state: {
            proposalNumber:    result.data.proposalNumber,
            proposalId:        result.data.proposalId,
            requiredDocuments: result.data.requiredDocuments,
            planName:          plan.name,
            submittedAt:       result.data.submittedAt,
          }
        });
      } else {
        alert('Error: ' + result.message);
      }
    } catch {
      alert('Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, plan, calcTotal, id, navigate]);

  /* ── loading / error states ── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 livishield-border-accent mx-auto mb-3" />
          <p className="text-sm livishield-text-secondary">Loading...</p>
        </div>
      </div>
    </div>
  );

  if (fetchError || !plan) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <p className="font-medium text-gray-800 mb-1">Plan not found</p>
        <p className="text-sm text-gray-500 mb-4">{fetchError}</p>
        <Button onClick={() => navigate('/health-insurance/plans')}><ArrowLeft className="h-4 w-4 mr-1" />Back to Plans</Button>
      </div>
    </div>
  );

  const total = calcTotal();
  const visibleSteps = plan.addOns?.length ? STEPS : STEPS.filter(s => s.id !== 'addons');
  const isLastStep = step === visibleSteps.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Top bar ── */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/health-insurance/plan/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-1" />Back
          </Button>
          <div className="h-5 w-px bg-gray-200" />
          <div className="min-w-0">
            <p className="text-sm font-semibold livishield-text-primary truncate">{plan.name}</p>
            <p className="text-xs livishield-text-secondary truncate">{plan.provider}</p>
          </div>
          <div className="ml-auto text-right shrink-0">
            <p className="text-xs text-gray-400">Total / year</p>
            <p className="text-base font-bold livishield-text-accent">{healthInsuranceService.formatCurrency(total)}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* ── Progress tracker ── */}
        <div className="bg-white rounded-xl border p-4 mb-6">
          <StepProgress steps={visibleSteps} current={step} />
        </div>

        {/* ── Two-column ── */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT: step card ── */}
          <div className="flex-1 min-w-0">
            <Card className="livishield-card">
              <CardContent className="p-6">

                {/* STEP 0 — Personal */}
                {visibleSteps[step]?.id === 'personal' && (
                  <div>
                    <h2 className="text-base font-semibold livishield-text-primary mb-4 flex items-center gap-2">
                      <User className="h-4 w-4 livishield-text-accent" />Personal Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <Field label="First Name" error={errors.firstName} required>
                        <input type="text" value={formData.firstName} onChange={e => set('firstName', e.target.value)}
                          className={ic(errors.firstName)} placeholder="First name" />
                      </Field>
                      <Field label="Last Name" error={errors.lastName} required>
                        <input type="text" value={formData.lastName} onChange={e => set('lastName', e.target.value)}
                          className={ic(errors.lastName)} placeholder="Last name" />
                      </Field>
                      <Field label="Email" error={errors.email} required>
                        <input type="email" value={formData.email} onChange={e => set('email', e.target.value)}
                          className={ic(errors.email)} placeholder="you@email.com" />
                      </Field>
                      <Field label="Phone" error={errors.phone} required>
                        <input type="tel" value={formData.phone} onChange={e => set('phone', e.target.value)}
                          className={ic(errors.phone)} placeholder="10-digit mobile number" />
                      </Field>
                      <Field label="Date of Birth" error={errors.dateOfBirth} required>
                        <input type="date" value={formData.dateOfBirth} onChange={e => set('dateOfBirth', e.target.value)}
                          className={ic(errors.dateOfBirth)}
                          max={new Date(new Date().setFullYear(new Date().getFullYear()-18)).toISOString().split('T')[0]} />
                      </Field>
                      <Field label="Gender" error={errors.gender} required>
                        <select value={formData.gender} onChange={e => set('gender', e.target.value)} className={ic(errors.gender)}>
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </Field>
                    </div>

                    {/* Family members sub-section (only for Family plan) */}
                    {plan.type === 'Family' && (
                      <div className="mt-4 pt-4 border-t">
                        <h3 className="text-sm font-semibold livishield-text-primary mb-3 flex items-center gap-2">
                          <Users className="h-4 w-4 livishield-text-accent" />Family Members
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 mb-3">
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <Field label="Name" error={errors.fm_name}>
                              <input type="text" value={familyMember.name} onChange={e => setFamilyMember(p => ({ ...p, name: e.target.value }))}
                                className={ic(errors.fm_name)} placeholder="Full name" />
                            </Field>
                            <Field label="Relationship" error={errors.fm_rel}>
                              <select value={familyMember.relationship} onChange={e => setFamilyMember(p => ({ ...p, relationship: e.target.value }))}
                                className={ic(errors.fm_rel)}>
                                <option value="">Select</option>
                                {['Spouse','Son','Daughter','Father','Mother','Father-in-law','Mother-in-law'].map(r => (
                                  <option key={r} value={r.toLowerCase()}>{r}</option>
                                ))}
                              </select>
                            </Field>
                            <Field label="Date of Birth" error={errors.fm_dob}>
                              <input type="date" value={familyMember.dateOfBirth} onChange={e => setFamilyMember(p => ({ ...p, dateOfBirth: e.target.value }))}
                                className={ic(errors.fm_dob)} />
                            </Field>
                            <Field label="Gender" error={errors.fm_gen}>
                              <select value={familyMember.gender} onChange={e => setFamilyMember(p => ({ ...p, gender: e.target.value }))}
                                className={ic(errors.fm_gen)}>
                                <option value="">Select</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            </Field>
                          </div>
                          <Button type="button" size="sm" onClick={addFamilyMember} className="livishield-btn-primary">+ Add Member</Button>
                        </div>
                        {formData.familyMembers.map(m => (
                          <div key={m.id} className="flex items-center justify-between p-3 bg-white border rounded-lg mb-2">
                            <div>
                              <p className="text-sm font-medium">{m.name}</p>
                              <p className="text-xs text-gray-500 capitalize">{m.relationship} · {m.gender} · {new Date().getFullYear() - new Date(m.dateOfBirth).getFullYear()} yrs</p>
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeFamilyMember(m.id)}
                              className="text-red-500 hover:bg-red-50 text-xs h-7 px-2">Remove</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 1 — Address */}
                {visibleSteps[step]?.id === 'address' && (
                  <div>
                    <h2 className="text-base font-semibold livishield-text-primary mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4 livishield-text-accent" />Address Information
                    </h2>
                    <Field label="Street Address" error={errors.address} required>
                      <textarea value={formData.address} onChange={e => set('address', e.target.value)}
                        className={ic(errors.address)} rows="2" placeholder="House no., street, area" />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
                      <Field label="City" error={errors.city} required>
                        <input type="text" value={formData.city} onChange={e => set('city', e.target.value)}
                          className={ic(errors.city)} placeholder="City" />
                      </Field>
                      <Field label="State" error={errors.state} required>
                        <input type="text" value={formData.state} onChange={e => set('state', e.target.value)}
                          className={ic(errors.state)} placeholder="State" />
                      </Field>
                      <Field label="PIN Code" error={errors.pincode} required>
                        <input type="text" value={formData.pincode} onChange={e => set('pincode', e.target.value)}
                          className={ic(errors.pincode)} placeholder="6-digit PIN" maxLength="6" />
                      </Field>
                    </div>
                  </div>
                )}

                {/* STEP 2 — Medical */}
                {visibleSteps[step]?.id === 'medical' && (
                  <div>
                    <h2 className="text-base font-semibold livishield-text-primary mb-4 flex items-center gap-2">
                      <Heart className="h-4 w-4 livishield-text-accent" />Medical Information
                    </h2>
                    <Field label="Pre-existing Conditions" error={errors.preExistingConditions} required>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 border rounded-lg bg-gray-50">
                        {CONDITIONS.map(c => (
                          <label key={c} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox"
                              checked={formData.preExistingConditions.includes(c)}
                              onChange={e => {
                                if (e.target.checked) {
                                  set('preExistingConditions', c === 'None' ? ['None'] : [...formData.preExistingConditions.filter(x => x !== 'None'), c]);
                                } else {
                                  set('preExistingConditions', formData.preExistingConditions.filter(x => x !== c));
                                }
                              }}
                              className="rounded border-gray-300" />
                            <span className="text-xs">{c}</span>
                          </label>
                        ))}
                      </div>
                    </Field>
                    <Field label="Current Medications (optional)">
                      <textarea value={formData.currentMedications} onChange={e => set('currentMedications', e.target.value)}
                        className={ic(false)} rows="2" placeholder="List any medications you currently take" />
                    </Field>
                    <Field label="Previous Health Insurance">
                      <div className="flex gap-6 mt-1">
                        {[{v: false, l:'No — first time'},{v: true, l:'Yes — had before'}].map(opt => (
                          <label key={String(opt.v)} className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="prevIns" checked={formData.previousInsurance === opt.v}
                              onChange={() => set('previousInsurance', opt.v)} />
                            <span className="text-sm">{opt.l}</span>
                          </label>
                        ))}
                      </div>
                    </Field>
                    {formData.previousInsurance && (
                      <Field label="Previous Insurance Details" error={errors.previousInsuranceDetails} required>
                        <textarea value={formData.previousInsuranceDetails} onChange={e => set('previousInsuranceDetails', e.target.value)}
                          className={ic(errors.previousInsuranceDetails)} rows="2"
                          placeholder="Company name, policy period, claims made..." />
                      </Field>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <Field label="Preferred Hospitals (optional)">
                        <textarea value={formData.preferredHospitals} onChange={e => set('preferredHospitals', e.target.value)}
                          className={ic(false)} rows="2" placeholder="Hospitals you prefer" />
                      </Field>
                      <Field label="Additional Requirements (optional)">
                        <textarea value={formData.additionalRequirements} onChange={e => set('additionalRequirements', e.target.value)}
                          className={ic(false)} rows="2" placeholder="Any specific requirements" />
                      </Field>
                    </div>
                  </div>
                )}

                {/* STEP 3 — Add-ons */}
                {visibleSteps[step]?.id === 'addons' && (
                  <div>
                    <h2 className="text-base font-semibold livishield-text-primary mb-1 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 livishield-text-accent" />Optional Add-ons
                    </h2>
                    <p className="text-xs text-gray-500 mb-4">Enhance your coverage — all optional</p>
                    <div className="space-y-2">
                      {plan.addOns.map((addon, idx) => {
                        const sel = formData.selectedAddOns.some(a => a.name === addon.name);
                        return (
                          <label key={idx} className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                            sel ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}>
                            <input type="checkbox" checked={sel} onChange={() => toggleAddOn(addon)} className="mt-0.5 rounded" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{addon.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{addon.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-semibold livishield-text-accent">+{healthInsuranceService.formatCurrency(addon.premium)}</p>
                              <p className="text-xs text-gray-400">/year</p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* STEP 4 — Review */}
                {visibleSteps[step]?.id === 'review' && (
                  <div>
                    <h2 className="text-base font-semibold livishield-text-primary mb-4 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 livishield-text-accent" />Review & Submit
                    </h2>
                    <div className="space-y-4">
                      {/* Personal */}
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Personal</p>
                          <button onClick={() => setStep(0)} className="text-xs livishield-text-accent hover:underline">Edit</button>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                          <span className="text-gray-500">Name</span><span className="font-medium">{formData.firstName} {formData.lastName}</span>
                          <span className="text-gray-500">Email</span><span className="font-medium truncate">{formData.email}</span>
                          <span className="text-gray-500">Phone</span><span className="font-medium">{formData.phone}</span>
                          <span className="text-gray-500">DOB</span><span className="font-medium">{formData.dateOfBirth}</span>
                          <span className="text-gray-500">Gender</span><span className="font-medium capitalize">{formData.gender}</span>
                        </div>
                      </div>
                      {/* Address */}
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Address</p>
                          <button onClick={() => setStep(1)} className="text-xs livishield-text-accent hover:underline">Edit</button>
                        </div>
                        <p className="text-sm">{formData.address}, {formData.city}, {formData.state} — {formData.pincode}</p>
                      </div>
                      {/* Medical */}
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Medical</p>
                          <button onClick={() => setStep(2)} className="text-xs livishield-text-accent hover:underline">Edit</button>
                        </div>
                        <p className="text-sm"><span className="text-gray-500">Conditions: </span>{formData.preExistingConditions.join(', ') || '—'}</p>
                        {formData.currentMedications && <p className="text-sm mt-1"><span className="text-gray-500">Medications: </span>{formData.currentMedications}</p>}
                      </div>
                      {/* Add-ons */}
                      {formData.selectedAddOns.length > 0 && (
                        <div className="rounded-lg border p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Selected Add-ons</p>
                          {formData.selectedAddOns.map(a => (
                            <div key={a.name} className="flex justify-between text-sm">
                              <span>{a.name}</span>
                              <span className="font-medium livishield-text-accent">+{healthInsuranceService.formatCurrency(a.premium)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Family */}
                      {formData.familyMembers.length > 0 && (
                        <div className="rounded-lg border p-4">
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Family Members</p>
                          {formData.familyMembers.map(m => (
                            <p key={m.id} className="text-sm capitalize">{m.name} · {m.relationship} · {new Date().getFullYear() - new Date(m.dateOfBirth).getFullYear()} yrs</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Nav buttons ── */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <Button variant="outline" onClick={back} disabled={step === 0} className="gap-1">
                    <ArrowLeft className="h-4 w-4" />Previous
                  </Button>
                  {isLastStep ? (
                    <Button onClick={submitProposal} disabled={isSubmitting} className="livishield-btn-primary gap-2 px-6">
                      {isSubmitting ? (
                        <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />Submitting...</>
                      ) : (
                        <><Shield className="h-4 w-4" />Submit Proposal</>
                      )}
                    </Button>
                  ) : (
                    <Button onClick={next} className="livishield-btn-primary gap-1 px-6">
                      Next<ArrowRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT: sticky plan + premium ── */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Plan summary */}
              <Card className="livishield-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex gap-1 mb-1">
                        {plan.popular && <Badge className="livishield-badge-accent text-xs">Popular</Badge>}
                        {plan.recommended && <Badge className="livishield-badge-secondary text-xs">Recommended</Badge>}
                      </div>
                      <p className="text-sm font-bold livishield-text-primary">{plan.name}</p>
                      <p className="text-xs livishield-text-secondary">{plan.provider}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                      <span className="text-xs font-medium">{plan.rating}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs mb-3">{plan.type}</Badge>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Sum Insured', value: healthInsuranceService.formatCurrency(plan.sumInsured) },
                      { label: 'Hospitals',   value: `${healthInsuranceService.formatNumber(plan.networkHospitals)}+` },
                      { label: 'Claim Ratio', value: `${plan.claimSettlementRatio}%` },
                      { label: 'Renewal Age', value: `Up to ${plan.renewalAge}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-lg p-2 text-center">
                        <p className="text-xs font-semibold livishield-text-primary">{value}</p>
                        <p className="text-xs text-gray-400">{label}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Premium breakdown */}
              <Card className="livishield-card">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Premium Breakdown</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Base</span>
                      <span className="font-medium">{healthInsuranceService.formatCurrency(plan.premium.annual)}</span>
                    </div>
                    {plan.type === 'Family' && formData.familyMembers.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Family ({formData.familyMembers.length})</span>
                        <span className="font-medium">+{healthInsuranceService.formatCurrency(Math.round(formData.familyMembers.length * plan.premium.annual * 0.3))}</span>
                      </div>
                    )}
                    {formData.selectedAddOns.map(a => (
                      <div key={a.name} className="flex justify-between">
                        <span className="text-gray-500 truncate mr-2 max-w-[120px]">{a.name}</span>
                        <span className="font-medium shrink-0">+{healthInsuranceService.formatCurrency(a.premium)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-semibold">Total / year</span>
                        <span className="text-lg font-bold livishield-text-accent">{healthInsuranceService.formatCurrency(total)}</span>
                      </div>
                      <p className="text-xs text-gray-400 text-right">{healthInsuranceService.formatCurrency(Math.round(total/12))} / month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <p className="text-xs text-gray-400 text-center px-2">
                By submitting you agree to our terms and conditions.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HealthInsuranceQuote;
