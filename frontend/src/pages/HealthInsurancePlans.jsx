import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Filter,
  Search,
  X
} from 'lucide-react';
import healthInsuranceService from '../services/healthInsuranceService';
import '../styles/theme.css';

const HealthInsurancePlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    minSumInsured: '',
    maxSumInsured: '',
    minPremium: '',
    maxPremium: '',
    provider: '',
    popular: false,
    recommended: false
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('premium.annual');
  const [sortOrder, setSortOrder] = useState('asc');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPlans: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, [filters, sortBy, sortOrder, pagination.currentPage, searchTerm]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== filters.provider) {
        handleFilterChange('provider', searchTerm);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const queryFilters = {
        ...filters,
        page: pagination.currentPage,
        limit: 12,
        sortBy,
        sortOrder
      };

      const data = await healthInsuranceService.getAllPlans(queryFilters);
      setPlans(data.plans);
      setPagination(data.pagination);
    } catch (err) {
      setError('Failed to fetch health insurance plans');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      minSumInsured: '',
      maxSumInsured: '',
      minPremium: '',
      maxPremium: '',
      provider: '',
      popular: false,
      recommended: false
    });
    setSearchTerm('');
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const PlanCard = ({ plan }) => (
    <Card className="livishield-hover-lift livishield-card h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            {plan.popular && (
              <Badge className="livishield-badge-accent text-xs">Popular</Badge>
            )}
            {plan.recommended && (
              <Badge className="livishield-badge-secondary text-xs">Recommended</Badge>
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
        <div className="mb-4">
          <div className="text-2xl font-bold livishield-text-accent mb-1">
            {healthInsuranceService.formatCurrency(plan.premium.annual)}
            <span className="text-sm font-normal livishield-text-secondary">/year</span>
          </div>
          <div className="text-sm livishield-text-secondary">
            {healthInsuranceService.formatCurrency(plan.premium.monthly)}/month
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm livishield-text-secondary">Sum Insured</span>
            <span className="font-semibold livishield-text-primary">
              {healthInsuranceService.formatCurrency(plan.sumInsured)}
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm livishield-text-secondary">Network Hospitals</span>
            <span className="font-semibold livishield-text-primary">
              {healthInsuranceService.formatNumber(plan.networkHospitals)}+
            </span>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm livishield-text-secondary">Claim Settlement</span>
            <span className="font-semibold livishield-text-primary">{plan.claimSettlementRatio}%</span>
          </div>
        </div>

        <div className="mb-4 flex-1">
          <h4 className="font-semibold livishield-text-primary mb-2">Key Features</h4>
          <div className="space-y-1">
            {plan.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 livishield-text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm livishield-text-secondary">{feature.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-2 mt-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => navigate(`/health-insurance/plan/${plan._id}`)}
          >
            View Details
          </Button>
          <Button 
            size="sm" 
            className="flex-1 livishield-btn-primary"
            onClick={() => navigate(`/health-insurance/quote/${plan._id}`)}
          >
            Get Quote
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading && plans.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 livishield-border-accent mx-auto mb-4"></div>
            <p className="livishield-text-secondary">Loading health insurance plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="livishield-gradient-bg text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Health Insurance Plans
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mb-6 max-w-3xl mx-auto">
              Compare and choose from our comprehensive range of health insurance plans 
              designed to protect you and your family's health and finances.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>{pagination.totalPlans} Plans Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>50K+ Network Hospitals</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Comprehensive Coverage</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 livishield-text-secondary" />
              <input
                type="text"
                placeholder="Search by provider name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Plan Type</label>
                    <select
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">All Types</option>
                      <option value="Individual">Individual</option>
                      <option value="Family">Family</option>
                      <option value="Senior Citizen">Senior Citizen</option>
                      <option value="Critical Illness">Critical Illness</option>
                      <option value="Group">Group</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Min Sum Insured</label>
                    <select
                      value={filters.minSumInsured}
                      onChange={(e) => handleFilterChange('minSumInsured', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Any Amount</option>
                      <option value="300000">₹3 Lakh</option>
                      <option value="500000">₹5 Lakh</option>
                      <option value="1000000">₹10 Lakh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Max Annual Premium</label>
                    <select
                      value={filters.maxPremium}
                      onChange={(e) => handleFilterChange('maxPremium', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Any Amount</option>
                      <option value="15000">₹15,000</option>
                      <option value="25000">₹25,000</option>
                      <option value="35000">₹35,000</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Sort By</label>
                    <select
                      value={`${sortBy}-${sortOrder}`}
                      onChange={(e) => {
                        const [field, order] = e.target.value.split('-');
                        setSortBy(field);
                        setSortOrder(order);
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="premium.annual-asc">Premium: Low to High</option>
                      <option value="premium.annual-desc">Premium: High to Low</option>
                      <option value="sumInsured-desc">Sum Insured: High to Low</option>
                      <option value="rating-desc">Rating: High to Low</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.popular}
                      onChange={(e) => handleFilterChange('popular', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Popular Plans Only</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={filters.recommended}
                      onChange={(e) => handleFilterChange('recommended', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Recommended Plans Only</span>
                  </label>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={clearFilters} className="flex items-center space-x-2">
                    <X className="h-4 w-4" />
                    <span>Clear Filters</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold livishield-text-primary">
              {pagination.totalPlans} Health Insurance Plans Found
            </h2>
            <p className="text-sm livishield-text-secondary">
              Showing {((pagination.currentPage - 1) * 12) + 1} - {Math.min(pagination.currentPage * 12, pagination.totalPlans)} of {pagination.totalPlans} plans
            </p>
          </div>
        </div>

        {/* Plans Grid */}
        {error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">
              <Heart className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Error Loading Plans</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={fetchPlans}>Try Again</Button>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <div className="livishield-text-secondary mb-4">
              <Search className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">No Plans Found</p>
              <p className="text-sm">Try adjusting your filters or search criteria</p>
            </div>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {plans.map((plan) => (
              <PlanCard key={plan._id} plan={plan} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2">
            <Button
              variant="outline"
              disabled={!pagination.hasPrev}
              onClick={() => handlePageChange(pagination.currentPage - 1)}
            >
              Previous
            </Button>
            
            {[...Array(pagination.totalPages)].map((_, index) => {
              const page = index + 1;
              if (
                page === 1 ||
                page === pagination.totalPages ||
                (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={page === pagination.currentPage ? "default" : "outline"}
                    onClick={() => handlePageChange(page)}
                    className={page === pagination.currentPage ? "livishield-btn-primary" : ""}
                  >
                    {page}
                  </Button>
                );
              } else if (
                page === pagination.currentPage - 2 ||
                page === pagination.currentPage + 2
              ) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}
            
            <Button
              variant="outline"
              disabled={!pagination.hasNext}
              onClick={() => handlePageChange(pagination.currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthInsurancePlans;