import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  CheckCircle, 
  Star,
  ArrowRight,
  Heart,
  Shield,
  Users
} from 'lucide-react';
import healthInsuranceService from '../services/healthInsuranceService';
import '../styles/theme.css';

const FeaturedHealthPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedPlans();
  }, []);

  const fetchFeaturedPlans = async () => {
    try {
      setLoading(true);
      const data = await healthInsuranceService.getFeaturedPlans(3);
      setPlans(data);
    } catch (err) {
      setError('Failed to fetch featured plans');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const PlanCard = ({ plan, index }) => (
    <Card className={`livishield-hover-lift livishield-card h-full flex flex-col ${
      index === 1 ? 'ring-2 livishield-ring-accent transform scale-105' : ''
    }`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            {plan.popular && (
              <Badge className="livishield-badge-accent text-xs">Popular</Badge>
            )}
            {plan.recommended && (
              <Badge className="livishield-badge-secondary text-xs">Recommended</Badge>
            )}
            {index === 1 && (
              <Badge className="bg-yellow-500 text-white text-xs">Best Value</Badge>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{plan.rating}</span>
          </div>
        </div>
        <CardTitle className="text-xl livishield-text-primary mb-1">{plan.name}</CardTitle>
        <p className="text-sm livishield-text-secondary">{plan.provider}</p>
        <Badge variant="outline" className="w-fit mt-2">{plan.type}</Badge>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold livishield-text-accent mb-1">
            {healthInsuranceService.formatCurrency(plan.premium.annual)}
            <span className="text-sm font-normal livishield-text-secondary">/year</span>
          </div>
          <div className="text-sm livishield-text-secondary">
            {healthInsuranceService.formatCurrency(plan.premium.monthly)}/month
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between p-3 livishield-section-light rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 livishield-text-accent" />
              <span className="text-sm livishield-text-secondary">Sum Insured</span>
            </div>
            <span className="font-semibold livishield-text-primary">
              {healthInsuranceService.formatCurrency(plan.sumInsured)}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 livishield-section-light rounded-lg">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 livishield-text-accent" />
              <span className="text-sm livishield-text-secondary">Network Hospitals</span>
            </div>
            <span className="font-semibold livishield-text-primary">
              {healthInsuranceService.formatNumber(plan.networkHospitals)}+
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 livishield-section-light rounded-lg">
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4 livishield-text-accent" />
              <span className="text-sm livishield-text-secondary">Claim Settlement</span>
            </div>
            <span className="font-semibold livishield-text-primary">{plan.claimSettlementRatio}%</span>
          </div>
        </div>

        <div className="mb-6 flex-1">
          <h4 className="font-semibold livishield-text-primary mb-3">Key Features</h4>
          <div className="space-y-2">
            {plan.features.slice(0, 4).map((feature, featureIndex) => (
              <div key={featureIndex} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 livishield-text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm livishield-text-secondary">{feature.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 mt-auto">
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
            onClick={() => navigate(`/health-insurance/plan/${plan._id}`)}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              Featured Health Insurance Plans
            </h2>
            <p className="text-lg sm:text-xl livishield-text-secondary max-w-3xl mx-auto">
              Choose from our most popular and recommended health insurance plans
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="livishield-card rounded-lg p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || plans.length === 0) {
    return (
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              Featured Health Insurance Plans
            </h2>
            <p className="text-lg sm:text-xl livishield-text-secondary max-w-3xl mx-auto">
              Choose from our most popular and recommended health insurance plans
            </p>
          </div>
          
          <div className="text-center py-12">
            <div className="livishield-text-secondary mb-4">
              <Heart className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Plans Coming Soon</p>
              <p className="text-sm">We're preparing amazing health insurance plans for you</p>
            </div>
            <Button onClick={() => navigate('/health-insurance/plans')}>
              View All Plans
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
            Featured Health Insurance Plans
          </h2>
          <p className="text-lg sm:text-xl livishield-text-secondary max-w-3xl mx-auto">
            Choose from our most popular and recommended health insurance plans designed 
            to provide comprehensive coverage for you and your family.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => (
            <PlanCard key={plan._id} plan={plan} index={index} />
          ))}
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="livishield-btn-secondary"
            onClick={() => navigate('/health-insurance/plans')}
          >
            View More Plans
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedHealthPlans;