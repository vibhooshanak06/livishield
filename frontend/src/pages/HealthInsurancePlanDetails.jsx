import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Heart, 
  CheckCircle, 
  Star,
  Users,
  Shield,
  Clock,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
  Info,
  X
} from 'lucide-react';
import healthInsuranceService from '../services/healthInsuranceService';
import '../styles/theme.css';

const HealthInsurancePlanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 livishield-border-accent mx-auto mb-4"></div>
            <p className="livishield-text-secondary">Loading plan details...</p>
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'features', label: 'Features & Benefits', icon: CheckCircle },
    { id: 'coverage', label: 'Coverage Details', icon: Shield },
    { id: 'exclusions', label: 'Exclusions', icon: X },
    { id: 'addons', label: 'Add-ons', icon: DollarSign }
  ];

  const TabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 livishield-text-accent" />
                    <span>Plan Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="livishield-text-secondary">Sum Insured</span>
                    <span className="font-semibold">{healthInsuranceService.formatCurrency(plan.sumInsured)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="livishield-text-secondary">Annual Premium</span>
                    <span className="font-semibold">{healthInsuranceService.formatCurrency(plan.premium.annual)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="livishield-text-secondary">Monthly Premium</span>
                    <span className="font-semibold">{healthInsuranceService.formatCurrency(plan.premium.monthly)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="livishield-text-secondary">Age Range</span>
                    <span className="font-semibold">{plan.ageRange.min} - {plan.ageRange.max} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="livishield-text-secondary">Renewal Age</span>
                    <span className="font-semibold">Up to {plan.renewalAge} years</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 livishield-text-accent" />
                    <span>Network & Claims</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="livishield-text-secondary">Network Hospitals</span>
                    <span className="font-semibold">{healthInsuranceService.formatNumber(plan.networkHospitals)}+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="livishield-text-secondary">Cashless Hospitals</span>
                    <span className="font-semibold">{healthInsuranceService.formatNumber(plan.cashlessHospitals)}+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="livishield-text-secondary">Claim Settlement Ratio</span>
                    <span className="font-semibold text-green-600">{plan.claimSettlementRatio}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="livishield-text-secondary">Co-payment</span>
                    <span className="font-semibold">
                      {plan.coPayment.applicable ? `${plan.coPayment.percentage}%` : 'No Co-payment'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="livishield-text-secondary">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-semibold">{plan.rating}/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 livishield-text-accent" />
                  <span>Waiting Periods</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 livishield-section-light rounded-lg">
                    <div className="text-2xl font-bold livishield-text-accent mb-1">{plan.waitingPeriods.initial}</div>
                    <div className="text-sm livishield-text-secondary">Initial Waiting (Days)</div>
                  </div>
                  <div className="text-center p-4 livishield-section-light rounded-lg">
                    <div className="text-2xl font-bold livishield-text-accent mb-1">{Math.floor(plan.waitingPeriods.preExisting / 365)}</div>
                    <div className="text-sm livishield-text-secondary">Pre-existing (Years)</div>
                  </div>
                  <div className="text-center p-4 livishield-section-light rounded-lg">
                    <div className="text-2xl font-bold livishield-text-accent mb-1">{Math.floor(plan.waitingPeriods.specificDiseases / 365)}</div>
                    <div className="text-sm livishield-text-secondary">Specific Diseases (Years)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'features':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 livishield-section-light rounded-lg">
                      <CheckCircle className="h-5 w-5 livishield-text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold livishield-text-primary mb-1">{feature.name}</h4>
                        <p className="text-sm livishield-text-secondary">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Additional Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {plan.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 livishield-section-light rounded-lg">
                      <Heart className="h-5 w-5 livishield-text-accent mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold livishield-text-primary mb-1">{benefit.name}</h4>
                        <p className="text-sm livishield-text-secondary">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'coverage':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Coverage Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(plan.coverage).map(([key, value]) => {
                  if (typeof value === 'object' && value.covered !== undefined) {
                    return (
                      <div key={key} className="flex items-center justify-between p-3 livishield-section-light rounded-lg">
                        <span className="capitalize livishield-text-secondary">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            value.covered ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {value.covered ? 'Covered' : 'Not Covered'}
                          </div>
                          {value.days && (
                            <div className="text-xs livishield-text-secondary mt-1">{value.days} days</div>
                          )}
                          {value.limit && (
                            <div className="text-xs livishield-text-secondary mt-1">{value.limit}</div>
                          )}
                        </div>
                      </div>
                    );
                  } else if (typeof value === 'boolean') {
                    return (
                      <div key={key} className="flex items-center justify-between p-3 livishield-section-light rounded-lg">
                        <span className="capitalize livishield-text-secondary">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {value ? 'Covered' : 'Not Covered'}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </CardContent>
          </Card>
        );

      case 'exclusions':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">What's Not Covered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.exclusions.map((exclusion, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <X className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-red-800 mb-1">{exclusion.category}</h4>
                      <p className="text-sm text-red-600">{exclusion.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 'addons':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Available Add-ons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {plan.addOns.map((addon, index) => (
                  <div key={index} className="flex items-start justify-between p-4 livishield-section-light rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold livishield-text-primary mb-1">{addon.name}</h4>
                      <p className="text-sm livishield-text-secondary">{addon.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <div className="font-semibold livishield-text-accent">
                        +{healthInsuranceService.formatCurrency(addon.premium)}
                      </div>
                      <div className="text-xs livishield-text-secondary">per year</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Header */}
      <section className="livishield-gradient-bg text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/health-insurance/plans')}
              className="text-white hover:bg-white/10 mr-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Plans
            </Button>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {plan.popular && (
                  <Badge className="bg-yellow-500 text-white">Popular</Badge>
                )}
                {plan.recommended && (
                  <Badge className="bg-green-500 text-white">Recommended</Badge>
                )}
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-medium">{plan.rating}</span>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{plan.name}</h1>
              <p className="text-lg text-white/90 mb-2">{plan.provider}</p>
              <Badge variant="outline" className="border-white text-white">{plan.type}</Badge>
            </div>
            
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="livishield-card p-6 text-center">
                <div className="text-3xl font-bold livishield-text-accent mb-2">
                  {healthInsuranceService.formatCurrency(plan.premium.annual)}
                  <span className="text-sm font-normal livishield-text-secondary">/year</span>
                </div>
                <div className="text-sm livishield-text-secondary mb-4">
                  {healthInsuranceService.formatCurrency(plan.premium.monthly)}/month
                </div>
                <div className="space-y-2">
                  <Button 
                    className="w-full livishield-btn-primary"
                    onClick={() => navigate(`/health-insurance/quote/${plan._id}`)}
                  >
                    Get Quote
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open('tel:+911234567890')}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Call Expert
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <TabContent />
      </div>
    </div>
  );
};

export default HealthInsurancePlanDetails;