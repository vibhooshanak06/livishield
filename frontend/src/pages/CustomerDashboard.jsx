import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import UserDebugInfo from '../components/UserDebugInfo';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import proposalService from '../services/proposalService';
import { 
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  Upload,
  Shield,
  Bell,
  Settings,
  CreditCard
} from 'lucide-react';
import '../styles/theme.css';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('proposals');
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalProposals: 0,
    activeProposals: 0,
    approvedPolicies: 0,
    pendingDocuments: 0
  });

  useEffect(() => {
    if (user?.id) {
      fetchUserProposals();
    }
  }, [user]);

  const fetchUserProposals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      const data = await proposalService.getCustomerDashboard(user.id);
      
      setProposals(data.proposals);
      setStats(data.stats);
    } catch (error) {
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'submitted': 'bg-blue-100 text-blue-800',
      'under_review': 'bg-yellow-100 text-yellow-800',
      'documents_required': 'bg-orange-100 text-orange-800',
      'medical_checkup_required': 'bg-purple-100 text-purple-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'policy_issued': 'bg-emerald-100 text-emerald-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'submitted': Clock,
      'under_review': Clock,
      'documents_required': AlertCircle,
      'medical_checkup_required': FileText,
      'approved': CheckCircle,
      'rejected': AlertCircle,
      'policy_issued': Shield,
      'cancelled': AlertCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="h-4 w-4" />;
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const StatCard = ({ title, value, icon: Icon, color = "livishield-text-accent" }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium livishield-text-secondary">{title}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
          </div>
          <Icon className={`h-8 w-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );

  const ProposalCard = ({ proposal }) => (
    <Card className="livishield-hover-lift">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold livishield-text-primary mb-1">
              {proposal.planId.name}
            </h3>
            <p className="text-sm livishield-text-secondary mb-2">
              {proposal.planId.provider}
            </p>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{proposal.planId.type}</Badge>
              <Badge className={getStatusColor(proposal.status)}>
                <div className="flex items-center space-x-1">
                  {getStatusIcon(proposal.status)}
                  <span>{formatStatus(proposal.status)}</span>
                </div>
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold livishield-text-accent">
              {proposalService.formatCurrency(proposal.premiumDetails.totalAnnualPremium)}
            </div>
            <div className="text-sm livishield-text-secondary">Annual Premium</div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="livishield-text-secondary">Proposal Number:</span>
            <span className="font-medium">{proposal.proposalNumber}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="livishield-text-secondary">Submitted:</span>
            <span className="font-medium">
              {proposalService.formatDate(proposal.submittedAt)}
            </span>
          </div>
          {proposal.policyDetails?.policyNumber && (
            <div className="flex justify-between text-sm">
              <span className="livishield-text-secondary">Policy Number:</span>
              <span className="font-medium">{proposal.policyDetails.policyNumber}</span>
            </div>
          )}
        </div>

        {proposal.status === 'documents_required' && proposal.requiredDocuments && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-orange-800">Documents Required</span>
            </div>
            <div className="text-xs text-orange-700">
              {proposal.requiredDocuments.filter(doc => !doc.uploaded).length} documents pending upload
            </div>
          </div>
        )}

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => alert('Proposal details page coming soon!')}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </Button>
          {proposal.status === 'documents_required' && (
            <Button 
              size="sm" 
              className="flex-1 livishield-btn-primary"
              onClick={() => alert('Document upload feature coming soon!')}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Docs
            </Button>
          )}
          {proposal.policyDetails?.policyNumber && (
            <Button 
              size="sm" 
              className="flex-1 livishield-btn-secondary"
              onClick={() => alert('Policy details page coming soon!')}
            >
              <Download className="mr-2 h-4 w-4" />
              Policy
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const tabs = [
    { id: 'proposals', label: 'My Proposals', icon: FileText },
    { id: 'policies', label: 'Active Policies', icon: Shield },
    { id: 'documents', label: 'Documents', icon: Upload },
    { id: 'payments', label: 'Payments', icon: CreditCard }
  ];

  const TabContent = () => {
    switch (activeTab) {
      case 'proposals':
        return (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 livishield-border-accent mx-auto mb-4"></div>
                <p className="livishield-text-secondary">Loading proposals...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-700 mb-2">Error Loading Data</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <Button 
                  onClick={fetchUserProposals}
                  className="livishield-btn-primary"
                >
                  Try Again
                </Button>
              </div>
            ) : proposals.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 livishield-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium livishield-text-primary mb-2">No Proposals Yet</h3>
                <p className="livishield-text-secondary mb-4">
                  You haven't submitted any health insurance proposals yet.
                </p>
                <Button 
                  className="livishield-btn-primary"
                  onClick={() => navigate('/health-insurance/plans')}
                >
                  Browse Health Plans
                </Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {proposals.map((proposal) => (
                  <ProposalCard key={proposal._id} proposal={proposal} />
                ))}
              </div>
            )}
          </div>
        );

      case 'policies':
        const activePolicies = proposals.filter(p => p.status === 'approved' || p.policyDetails?.policyNumber);
        return (
          <div className="space-y-6">
            {activePolicies.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 livishield-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium livishield-text-primary mb-2">No Active Policies</h3>
                <p className="livishield-text-secondary">
                  You don't have any active policies yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {activePolicies.map((proposal) => (
                  <ProposalCard key={proposal._id} proposal={proposal} />
                ))}
              </div>
            )}
          </div>
        );

      case 'documents':
        return (
          <div className="text-center py-12">
            <Upload className="h-12 w-12 livishield-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium livishield-text-primary mb-2">Document Management</h3>
            <p className="livishield-text-secondary">
              Document management feature coming soon.
            </p>
          </div>
        );

      case 'payments':
        return (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 livishield-text-secondary mx-auto mb-4" />
            <h3 className="text-lg font-medium livishield-text-primary mb-2">Payment History</h3>
            <p className="livishield-text-secondary">
              Payment management feature coming soon.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <UserDebugInfo />
      <Navbar />
      
      {/* Header */}
      <section className="livishield-gradient-bg text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
              <p className="text-white/90">Manage your health insurance applications and policies</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Proposals" 
            value={stats.totalProposals} 
            icon={FileText}
          />
          <StatCard 
            title="Active Applications" 
            value={stats.activeProposals} 
            icon={Clock}
            color="text-yellow-600"
          />
          <StatCard 
            title="Approved Policies" 
            value={stats.approvedPolicies} 
            icon={CheckCircle}
            color="text-green-600"
          />
          <StatCard 
            title="Pending Documents" 
            value={stats.pendingDocuments} 
            icon={AlertCircle}
            color="text-orange-600"
          />
        </div>

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

export default CustomerDashboard;