import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft,
  User,
  Users,
  Phone,
  Mail,
  Shield,
  CheckCircle,
  AlertCircle,
  FileText,
  Star,
  Calendar,
  MapPin,
  Heart,
  DollarSign,
  Clock
} from 'lucide-react';
import healthInsuranceService from '../services/healthInsuranceService';
import '../styles/theme.css';

// Add custom styles for form validation
const customStyles = `
  .error-field {
    animation: shake 0.5s ease-in-out;
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
`;

// Helper component for form fields with validation - moved outside to prevent re-creation
const FormField = ({ label, error, required = false, children }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium mb-2 text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className={error ? 'error-field' : ''}>
      {children}
    </div>
    {error && (
      <p className="mt-1 text-sm text-red-600 flex items-center">
        <AlertCircle className="h-4 w-4 mr-1" />
        {error}
      </p>
    )}
  </div>
);

const HealthInsuranceQuote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    
    // Address Information
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Family Information
    familyMembers: [],
    
    // Medical Information
    preExistingConditions: [],
    currentMedications: '',
    previousInsurance: false,
    previousInsuranceDetails: '',
    
    // Preferences
    preferredHospitals: '',
    additionalRequirements: '',
    
    // Selected Add-ons
    selectedAddOns: []
  });

  const [familyMember, setFamilyMember] = useState({
    name: '',
    relationship: '',
    dateOfBirth: '',
    gender: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPlanDetails();
  }, [id]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const data = await healthInsuranceService.getPlanById(id);
      setPlan(data);
    } catch (err) {
      setError('Failed to fetch plan details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [validationErrors]);

  // Create individual handlers for each field to prevent re-renders
  const handleFirstNameChange = useCallback((e) => handleInputChange('firstName', e.target.value), [handleInputChange]);
  const handleLastNameChange = useCallback((e) => handleInputChange('lastName', e.target.value), [handleInputChange]);
  const handleEmailChange = useCallback((e) => handleInputChange('email', e.target.value), [handleInputChange]);
  const handlePhoneChange = useCallback((e) => handleInputChange('phone', e.target.value), [handleInputChange]);
  const handleDateOfBirthChange = useCallback((e) => handleInputChange('dateOfBirth', e.target.value), [handleInputChange]);
  const handleGenderChange = useCallback((e) => handleInputChange('gender', e.target.value), [handleInputChange]);
  const handleAddressChange = useCallback((e) => handleInputChange('address', e.target.value), [handleInputChange]);
  const handleCityChange = useCallback((e) => handleInputChange('city', e.target.value), [handleInputChange]);
  const handleStateChange = useCallback((e) => handleInputChange('state', e.target.value), [handleInputChange]);
  const handlePincodeChange = useCallback((e) => handleInputChange('pincode', e.target.value), [handleInputChange]);
  const handleCurrentMedicationsChange = useCallback((e) => handleInputChange('currentMedications', e.target.value), [handleInputChange]);
  const handlePreviousInsuranceDetailsChange = useCallback((e) => handleInputChange('previousInsuranceDetails', e.target.value), [handleInputChange]);
  const handlePreferredHospitalsChange = useCallback((e) => handleInputChange('preferredHospitals', e.target.value), [handleInputChange]);
  const handleAdditionalRequirementsChange = useCallback((e) => handleInputChange('additionalRequirements', e.target.value), [handleInputChange]);

  const handleFamilyMemberChange = useCallback((field, value) => {
    setFamilyMember(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Family member field handlers
  const handleFamilyNameChange = useCallback((e) => handleFamilyMemberChange('name', e.target.value), [handleFamilyMemberChange]);
  const handleFamilyRelationshipChange = useCallback((e) => handleFamilyMemberChange('relationship', e.target.value), [handleFamilyMemberChange]);
  const handleFamilyDateOfBirthChange = useCallback((e) => handleFamilyMemberChange('dateOfBirth', e.target.value), [handleFamilyMemberChange]);
  const handleFamilyGenderChange = useCallback((e) => handleFamilyMemberChange('gender', e.target.value), [handleFamilyMemberChange]);

  // Radio button handlers
  const handlePreviousInsuranceFalse = useCallback(() => handleInputChange('previousInsurance', false), [handleInputChange]);
  const handlePreviousInsuranceTrue = useCallback(() => handleInputChange('previousInsurance', true), [handleInputChange]);

  const addFamilyMember = useCallback(() => {
    const errors = validateFamilyMember(familyMember);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(prev => ({ ...prev, ...errors }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      familyMembers: [...prev.familyMembers, { ...familyMember, id: Date.now() }]
    }));
    setFamilyMember({ name: '', relationship: '', dateOfBirth: '', gender: '' });
    
    // Clear any family member validation errors
    const familyErrorKeys = Object.keys(validationErrors).filter(key => key.startsWith('family_'));
    if (familyErrorKeys.length > 0) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        familyErrorKeys.forEach(key => delete newErrors[key]);
        return newErrors;
      });
    }
  }, [familyMember, validationErrors]);

  const removeFamilyMember = useCallback((id) => {
    setFormData(prev => ({
      ...prev,
      familyMembers: prev.familyMembers.filter(member => member.id !== id)
    }));
  }, []);

  const toggleAddOn = useCallback((addon) => {
    setFormData(prev => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.find(a => a.name === addon.name)
        ? prev.selectedAddOns.filter(a => a.name !== addon.name)
        : [...prev.selectedAddOns, addon]
    }));
  }, []);

  const calculateTotalPremium = useCallback(() => {
    if (!plan) return 0;
    
    let basePremium = plan.premium.annual;
    let addOnPremium = formData.selectedAddOns.reduce((sum, addon) => sum + addon.premium, 0);
    
    // Family member multiplier (simplified calculation)
    let familyMultiplier = 1;
    if (plan.type === 'Family' && formData.familyMembers.length > 0) {
      familyMultiplier = 1 + (formData.familyMembers.length * 0.3);
    }
    
    return Math.round((basePremium * familyMultiplier) + addOnPremium);
  }, [plan, formData.selectedAddOns, formData.familyMembers]);

  // Validation functions
  const validateForm = useCallback(() => {
    const errors = {};
    
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 18) {
        errors.dateOfBirth = 'You must be at least 18 years old';
      } else if (age > 80) {
        errors.dateOfBirth = 'Maximum age limit is 80 years';
      }
    }
    
    if (!formData.gender) {
      errors.gender = 'Gender is required';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }
    
    if (!formData.pincode.trim()) {
      errors.pincode = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      errors.pincode = 'Please enter a valid 6-digit PIN code';
    }

    // Pre-existing conditions validation
    if (formData.preExistingConditions.length === 0) {
      errors.preExistingConditions = 'Please select your medical condition status';
    }
    
    // If previous insurance is selected, details are required
    if (formData.previousInsurance && !formData.previousInsuranceDetails.trim()) {
      errors.previousInsuranceDetails = 'Please provide details about your previous insurance';
    }
    
    return errors;
  }, [formData]);

  const validateFamilyMember = useCallback((member) => {
    const errors = {};
    
    if (!member.name.trim()) {
      errors.family_name = 'Family member name is required';
    }
    
    if (!member.relationship) {
      errors.family_relationship = 'Relationship is required';
    }
    
    if (!member.dateOfBirth) {
      errors.family_dateOfBirth = 'Date of birth is required';
    } else {
      const birthDate = new Date(member.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 0) {
        errors.family_dateOfBirth = 'Invalid date of birth';
      } else if (age > 100) {
        errors.family_dateOfBirth = 'Age cannot exceed 100 years';
      }
    }
    
    if (!member.gender) {
      errors.family_gender = 'Gender is required';
    }
    
    return errors;
  }, []);

  const submitProposal = useCallback(async () => {
    // Final validation before submission
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Scroll to first error
      const firstErrorElement = document.querySelector('.error-field');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare proposal data
      const proposalData = {
        planId: id,
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode
          }
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
          addOnPremium: formData.selectedAddOns.reduce((sum, addon) => sum + addon.premium, 0),
          familyPremium: formData.familyMembers.length * plan.premium.annual * 0.3,
          totalAnnualPremium: calculateTotalPremium(),
          totalMonthlyPremium: Math.round(calculateTotalPremium() / 12)
        }
      };

      // Get authentication token
      const token = localStorage.getItem('liveshield_token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/proposals/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify(proposalData),
      });

      const result = await response.json();

      if (result.success) {
        // Navigate to success page with proposal details
        navigate('/health-insurance/proposal-success', {
          state: {
            proposalNumber: result.data.proposalNumber,
            proposalId: result.data.proposalId,
            requiredDocuments: result.data.requiredDocuments,
            planName: plan.name
          }
        });
      } else {
        alert('Error submitting proposal: ' + result.message);
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('Error submitting proposal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, formData, plan, calculateTotalPremium, id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 livishield-border-accent mx-auto mb-4"></div>
            <p className="livishield-text-secondary">Loading quote form...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <AlertCircle className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Plan Not Found</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={() => navigate('/health-insurance/plans')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plans
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{customStyles}</style>
      <Navbar />
      
      {/* Header */}
      <section className="bg-white border-b py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/health-insurance/plan/${id}`)}
              className="mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plan Details
            </Button>
            <div>
              <h1 className="text-3xl font-bold livishield-text-primary">Get Your Quote</h1>
              <p className="livishield-text-secondary mt-1">{plan.name} - {plan.provider}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Plan Summary Card */}
        <Card className="livishield-card mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  {plan.popular && (
                    <Badge className="livishield-badge-accent">Popular</Badge>
                  )}
                  {plan.recommended && (
                    <Badge className="livishield-badge-secondary">Recommended</Badge>
                  )}
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{plan.rating}</span>
                  </div>
                </div>
                <h2 className="text-xl font-bold livishield-text-primary mb-2">{plan.name}</h2>
                <p className="livishield-text-secondary mb-2">{plan.provider}</p>
                <Badge variant="outline">{plan.type}</Badge>
              </div>
              
              <div className="text-right">
                <div className="text-3xl font-bold livishield-text-accent mb-2">
                  {healthInsuranceService.formatCurrency(calculateTotalPremium())}
                  <span className="text-sm font-normal livishield-text-secondary">/year</span>
                </div>
                <div className="livishield-text-secondary">
                  {healthInsuranceService.formatCurrency(Math.round(calculateTotalPremium() / 12))}/month
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">{healthInsuranceService.formatCurrency(plan.sumInsured)}</div>
                    <div className="text-xs livishield-text-secondary">Sum Insured</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="font-semibold">{healthInsuranceService.formatNumber(plan.networkHospitals)}+</div>
                    <div className="text-xs livishield-text-secondary">Network Hospitals</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proposal Form */}
        <Card className="livishield-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 livishield-text-accent" />
              <span>Insurance Proposal Form</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 livishield-text-primary">
                  <User className="h-5 w-5 livishield-text-accent" />
                  <span>Personal Information</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField label="First Name" error={validationErrors.firstName} required>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={handleFirstNameChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent ${
                        validationErrors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your first name"
                    />
                  </FormField>
                  
                  <FormField label="Last Name" error={validationErrors.lastName} required>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={handleLastNameChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent ${
                        validationErrors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your last name"
                    />
                  </FormField>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField label="Email" error={validationErrors.email} required>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={handleEmailChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent ${
                        validationErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                  </FormField>
                  
                  <FormField label="Phone Number" error={validationErrors.phone} required>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent ${
                        validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your 10-digit phone number"
                    />
                  </FormField>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <FormField label="Date of Birth" error={validationErrors.dateOfBirth} required>
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleDateOfBirthChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent ${
                        validationErrors.dateOfBirth ? 'border-red-500' : 'border-gray-300'
                      }`}
                      max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    />
                  </FormField>
                  
                  <FormField label="Gender" error={validationErrors.gender} required>
                    <select
                      value={formData.gender}
                      onChange={handleGenderChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent ${
                        validationErrors.gender ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </FormField>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 livishield-text-primary">
                  <MapPin className="h-5 w-5 livishield-text-accent" />
                  <span>Address Information</span>
                </h3>
                
                <FormField label="Address" error={validationErrors.address} required>
                  <textarea
                    value={formData.address}
                    onChange={handleAddressChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent ${
                      validationErrors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows="3"
                    placeholder="Enter your complete address"
                  />
                </FormField>

                <div className="grid md:grid-cols-3 gap-4">
                  <FormField label="City" error={validationErrors.city} required>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={handleCityChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent ${
                        validationErrors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your city"
                    />
                  </FormField>
                  
                  <FormField label="State" error={validationErrors.state} required>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={handleStateChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent ${
                        validationErrors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your state"
                    />
                  </FormField>
                  
                  <FormField label="PIN Code" error={validationErrors.pincode} required>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={handlePincodeChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent ${
                        validationErrors.pincode ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter 6-digit PIN code"
                      maxLength="6"
                    />
                  </FormField>
                </div>
              </div>

              {/* Family Information */}
              {plan.type === 'Family' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 livishield-text-primary">
                    <Users className="h-5 w-5 livishield-text-accent" />
                    <span>Family Information</span>
                  </h3>
                  
                  {/* Add Family Member Form */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-3">Add Family Member</h4>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <FormField label="Name" error={validationErrors.family_name}>
                        <input
                          type="text"
                          value={familyMember.name}
                          onChange={handleFamilyNameChange}
                          className={`w-full p-3 border rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent ${
                            validationErrors.family_name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter family member name"
                        />
                      </FormField>
                      
                      <FormField label="Relationship" error={validationErrors.family_relationship}>
                        <select
                          value={familyMember.relationship}
                          onChange={handleFamilyRelationshipChange}
                          className={`w-full p-3 border rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent ${
                            validationErrors.family_relationship ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Relationship</option>
                          <option value="spouse">Spouse</option>
                          <option value="son">Son</option>
                          <option value="daughter">Daughter</option>
                          <option value="father">Father</option>
                          <option value="mother">Mother</option>
                          <option value="father-in-law">Father-in-law</option>
                          <option value="mother-in-law">Mother-in-law</option>
                        </select>
                      </FormField>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <FormField label="Date of Birth" error={validationErrors.family_dateOfBirth}>
                        <input
                          type="date"
                          value={familyMember.dateOfBirth}
                          onChange={handleFamilyDateOfBirthChange}
                          className={`w-full p-3 border rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent ${
                            validationErrors.family_dateOfBirth ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </FormField>
                      
                      <FormField label="Gender" error={validationErrors.family_gender}>
                        <select
                          value={familyMember.gender}
                          onChange={handleFamilyGenderChange}
                          className={`w-full p-3 border rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent ${
                            validationErrors.family_gender ? 'border-red-500' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select Gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </FormField>
                    </div>
                    
                    <Button 
                      type="button" 
                      onClick={addFamilyMember}
                      className="livishield-btn-primary"
                    >
                      Add Family Member
                    </Button>
                  </div>

                  {/* Family Members List */}
                  {formData.familyMembers.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Added Family Members ({formData.familyMembers.length})</h4>
                      {formData.familyMembers.map((member, index) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-gray-600">
                              {member.relationship} • {member.gender} • {new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear()} years
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFamilyMember(member.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 livishield-text-primary">
                  <Heart className="h-5 w-5 livishield-text-accent" />
                  <span>Medical Information</span>
                </h3>
                
                <FormField label="Pre-existing Medical Conditions" error={validationErrors.preExistingConditions} required>
                  <div className="space-y-2">
                    {[
                      'None',
                      'Diabetes',
                      'Hypertension',
                      'Heart Disease',
                      'Asthma',
                      'Thyroid',
                      'Kidney Disease',
                      'Cancer',
                      'Other'
                    ].map((condition) => (
                      <label key={condition} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.preExistingConditions.includes(condition)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              if (condition === 'None') {
                                handleInputChange('preExistingConditions', ['None']);
                              } else {
                                const filtered = formData.preExistingConditions.filter(c => c !== 'None');
                                handleInputChange('preExistingConditions', [...filtered, condition]);
                              }
                            } else {
                              handleInputChange('preExistingConditions', 
                                formData.preExistingConditions.filter(c => c !== condition)
                              );
                            }
                          }}
                          className="rounded border-gray-300 livishield-text-accent livishield-focus-ring"
                        />
                        <span className="text-sm">{condition}</span>
                      </label>
                    ))}
                  </div>
                </FormField>

                <FormField label="Current Medications (if any)">
                  <textarea
                    value={formData.currentMedications}
                    onChange={handleCurrentMedicationsChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent"
                    rows="3"
                    placeholder="List any current medications you are taking"
                  />
                </FormField>

                <FormField label="Previous Health Insurance">
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="previousInsurance"
                        checked={formData.previousInsurance === false}
                        onChange={handlePreviousInsuranceFalse}
                        className="livishield-text-accent livishield-focus-ring"
                      />
                      <span className="text-sm">No, this is my first health insurance</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="previousInsurance"
                        checked={formData.previousInsurance === true}
                        onChange={handlePreviousInsuranceTrue}
                        className="livishield-text-accent livishield-focus-ring"
                      />
                      <span className="text-sm">Yes, I have had health insurance before</span>
                    </label>
                  </div>
                </FormField>

                {formData.previousInsurance && (
                  <FormField label="Previous Insurance Details" error={validationErrors.previousInsuranceDetails} required>
                    <textarea
                      value={formData.previousInsuranceDetails}
                      onChange={handlePreviousInsuranceDetailsChange}
                      className={`w-full p-3 border rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent ${
                        validationErrors.previousInsuranceDetails ? 'border-red-500' : 'border-gray-300'
                      }`}
                      rows="3"
                      placeholder="Please provide details about your previous health insurance (company name, policy period, claims made, etc.)"
                    />
                  </FormField>
                )}

                <FormField label="Preferred Hospitals (Optional)">
                  <textarea
                    value={formData.preferredHospitals}
                    onChange={handlePreferredHospitalsChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent"
                    rows="2"
                    placeholder="List any specific hospitals you prefer for treatment"
                  />
                </FormField>

                <FormField label="Additional Requirements (Optional)">
                  <textarea
                    value={formData.additionalRequirements}
                    onChange={handleAdditionalRequirementsChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 livishield-focus-ring focus:border-transparent"
                    rows="3"
                    placeholder="Any specific requirements or questions about the policy"
                  />
                </FormField>
              </div>

              {/* Add-ons Selection */}
              {plan.addOns && plan.addOns.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2 livishield-text-primary">
                    <DollarSign className="h-5 w-5 livishield-text-accent" />
                    <span>Optional Add-ons</span>
                  </h3>
                  <p className="text-gray-600 mb-4">Enhance your coverage with these optional add-ons</p>
                  
                  <div className="space-y-3">
                    {plan.addOns.map((addon, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.selectedAddOns.some(a => a.name === addon.name)}
                              onChange={() => toggleAddOn(addon)}
                              className="mt-1 rounded border-gray-300 livishield-text-accent livishield-focus-ring"
                            />
                            <div>
                              <h4 className="font-medium">{addon.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                              {addon.benefits && (
                                <ul className="text-xs text-gray-500 mt-2 space-y-1">
                                  {addon.benefits.slice(0, 3).map((benefit, idx) => (
                                    <li key={idx} className="flex items-center space-x-1">
                                      <CheckCircle className="h-3 w-3" />
                                      <span>{benefit}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold livishield-text-accent">
                              +{healthInsuranceService.formatCurrency(addon.premium)}
                            </div>
                            <div className="text-xs text-gray-500">per year</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-lg font-semibold">Total Annual Premium</p>
                    <p className="text-2xl font-bold livishield-text-accent">
                      {healthInsuranceService.formatCurrency(calculateTotalPremium())}
                    </p>
                    <p className="text-sm text-gray-600">
                      Monthly: {healthInsuranceService.formatCurrency(Math.round(calculateTotalPremium() / 12))}
                    </p>
                  </div>
                </div>
                
                <Button
                  onClick={submitProposal}
                  disabled={isSubmitting}
                  className="w-full livishield-btn-primary py-3 text-lg font-semibold"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Submitting Proposal...</span>
                    </div>
                  ) : (
                    'Submit Proposal'
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 mt-3 text-center">
                  By submitting this proposal, you agree to our terms and conditions. 
                  Your information will be used to process your insurance application.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HealthInsuranceQuote;