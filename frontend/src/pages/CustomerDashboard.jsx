import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import proposalService from '../services/proposalService';
import paymentService from '../services/paymentService';
import {
  FileText, Clock, CheckCircle, AlertCircle, Eye,
  Upload, Shield, Bell, Settings, CreditCard, BadgeCheck
} from 'lucide-react';
import '../styles/theme.css';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('proposals');
  const [proposals, setProposals] = useState([]);
  const [payments,  setPayments]  = useState([]);
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
      'submitted':                  'bg-blue-100 text-blue-800',
      'under_review':               'bg-yellow-100 text-yellow-800',
      'documents_required':         'bg-orange-100 text-orange-800',
      'documents_expired':          'bg-red-100 text-red-800',
      'medical_checkup_required':   'bg-purple-100 text-purple-800',
      'approved':                   'bg-green-100 text-green-800',
      'rejected':                   'bg-red-100 text-red-800',
      'policy_issued':              'bg-emerald-100 text-emerald-800',
      'cancelled':                  'bg-gray-100 text-gray-800'
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

  const ProposalCard = ({ proposal }) => {
    const docs = proposal.requiredDocuments || [];
    const uploadedCount = docs.filter(d => d.uploaded).length;
    const mandatoryCount = docs.filter(d => d.required).length;
    const mandatoryDone = docs.filter(d => d.required && d.uploaded).length;
    const needsAction = ['submitted', 'documents_required', 'documents_expired'].includes(proposal.status);

    return (
      <Card className="livishield-hover-lift">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold livishield-text-primary mb-1">{proposal.planId.name}</h3>
              <p className="text-sm livishield-text-secondary mb-2">{proposal.planId.provider}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{proposal.planId.type}</Badge>
                <Badge className={getStatusColor(proposal.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(proposal.status)}
                    <span>{formatStatus(proposal.status)}</span>
                  </div>
                </Badge>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-semibold livishield-text-accent">
                {proposalService.formatCurrency(proposal.premiumDetails?.totalAnnualPremium || 0)}
              </div>
              <div className="text-sm livishield-text-secondary">Annual Premium</div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="livishield-text-secondary">Proposal Number:</span>
              <span className="font-medium font-mono">{proposal.proposalNumber}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="livishield-text-secondary">Submitted:</span>
              <span className="font-medium">{proposalService.formatDate(proposal.submittedAt)}</span>
            </div>
            {proposal.policyDetails?.policyNumber && (
              <div className="flex justify-between text-sm">
                <span className="livishield-text-secondary">Policy Number:</span>
                <span className="font-medium font-mono">{proposal.policyDetails.policyNumber}</span>
              </div>
            )}
          </div>

          {/* Document progress */}
          {docs.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Documents</span>
                <span>{mandatoryDone}/{mandatoryCount} mandatory uploaded</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${mandatoryDone === mandatoryCount ? 'bg-green-500' : 'livishield-bg-accent'}`}
                  style={{ width: `${mandatoryCount ? (mandatoryDone / mandatoryCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Status-specific alerts */}
          {proposal.status === 'documents_required' && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-800">Documents Required</span>
              </div>
              <p className="text-xs text-orange-700">
                {docs.filter(d => !d.uploaded).length} document(s) pending upload
              </p>
            </div>
          )}
          {proposal.status === 'documents_expired' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium text-red-800">Upload Window Expired</span>
              </div>
              <p className="text-xs text-red-700">Reactivate your proposal to upload documents.</p>
            </div>
          )}
          {proposal.status === 'medical_checkup_required' && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-800">Medical Checkup Required</span>
              </div>
            </div>
          )}
          {proposal.status === 'approved' && proposal.policyDetails && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Policy Active · {proposalService.formatDate(proposal.policyDetails.policyStartDate)} – {proposalService.formatDate(proposal.policyDetails.policyEndDate)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline" size="sm" className="flex-1 gap-1.5"
              onClick={() => navigate(`/proposals/${proposal._id}`)}
            >
              <Eye className="h-4 w-4" />View Details
            </Button>
            {needsAction && (
              <Button
                size="sm" className="flex-1 livishield-btn-primary gap-1.5"
                onClick={() => navigate('/health-insurance/proposal-success', {
                  state: {
                    proposalNumber: proposal.proposalNumber,
                    proposalId: proposal._id,
                    requiredDocuments: proposal.requiredDocuments || [],
                    planName: proposal.planId.name,
                    proposalStatus: proposal.status,
                    submittedAt: proposal.submittedAt,
                  }
                })}
              >
                <Upload className="h-4 w-4" />Upload Docs
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

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
        const allDocs = proposals.flatMap(p => 
          (p.requiredDocuments || []).map(d => ({
            ...d,
            proposalNumber: p.proposalNumber,
            proposalId: p._id,
            planName: p.planId?.name,
            proposalStatus: p.status,
          }))
        );
        const uploadedDocs = allDocs.filter(d => d.uploaded);
        const pendingDocs = allDocs.filter(d => !d.uploaded && d.required);

        return (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 livishield-border-accent mx-auto mb-4"></div>
                <p className="livishield-text-secondary">Loading documents...</p>
              </div>
            ) : allDocs.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="h-12 w-12 livishield-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium livishield-text-primary mb-2">No Documents Yet</h3>
                <p className="livishield-text-secondary mb-4">Submit a proposal to start uploading documents.</p>
                <Button className="livishield-btn-primary" onClick={() => navigate('/health-insurance/plans')}>
                  Browse Health Plans
                </Button>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card><CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold livishield-text-accent">{allDocs.length}</p>
                    <p className="text-sm livishield-text-secondary">Total Documents</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{uploadedDocs.length}</p>
                    <p className="text-sm livishield-text-secondary">Uploaded</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-orange-600">{pendingDocs.length}</p>
                    <p className="text-sm livishield-text-secondary">Pending Upload</p>
                  </CardContent></Card>
                </div>

                {/* Group by proposal */}
                {proposals.filter(p => (p.requiredDocuments || []).length > 0).map((proposal) => (
                  <Card key={proposal._id} className="livishield-card">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold livishield-text-primary">{proposal.planId?.name}</h3>
                          <p className="text-xs livishield-text-secondary font-mono">{proposal.proposalNumber}</p>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(proposal.status)}`}>
                          {formatStatus(proposal.status)}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {(proposal.requiredDocuments || []).map((doc) => (
                          <div key={doc.type} className={`flex items-center justify-between p-3 rounded-lg border ${
                            doc.uploaded ? 'border-green-200 bg-green-50' : 
                            doc.required ? 'border-orange-200 bg-orange-50' : 'border-gray-200 bg-gray-50'
                          }`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                doc.uploaded ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                                {doc.uploaded 
                                  ? <CheckCircle className="h-4 w-4 text-green-600" />
                                  : <AlertCircle className="h-4 w-4 text-gray-400" />
                                }
                              </div>
                              <div>
                                <p className="text-sm font-medium livishield-text-primary">{doc.name}</p>
                                {doc.uploaded && doc.fileName && (
                                  <p className="text-xs text-green-600 truncate max-w-[200px]">{doc.fileName}</p>
                                )}
                                {!doc.uploaded && (
                                  <p className={`text-xs ${doc.required ? 'text-orange-600' : 'text-gray-400'}`}>
                                    {doc.required ? 'Mandatory — not uploaded' : 'Optional — not uploaded'}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {doc.verificationStatus === 'verified' && (
                                <Badge className="text-xs bg-green-100 text-green-700 border-green-200">Verified</Badge>
                              )}
                              {doc.verificationStatus === 'rejected' && (
                                <Badge className="text-xs bg-red-100 text-red-700 border-red-200">Rejected</Badge>
                              )}
                              {doc.uploaded && !['verified','rejected'].includes(doc.verificationStatus) && (
                                <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">Pending Review</Badge>
                              )}
                              {['submitted','documents_required'].includes(proposal.status) && (
                                <Button size="sm" variant="outline" className="text-xs h-7"
                                  onClick={() => navigate('/health-insurance/proposal-success', {
                                    state: {
                                      proposalNumber: proposal.proposalNumber,
                                      proposalId: proposal._id,
                                      requiredDocuments: proposal.requiredDocuments || [],
                                      planName: proposal.planId?.name,
                                      proposalStatus: proposal.status,
                                      submittedAt: proposal.submittedAt,
                                    }
                                  })}>
                                  {doc.uploaded ? 'Replace' : 'Upload'}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        );

      case 'payments':
        const policiesWithPremiums = proposals.filter(p => p.premiumDetails?.totalAnnualPremium > 0);
        const totalPremiumPaid = proposals
          .filter(p => ['approved','policy_issued'].includes(p.status))
          .reduce((sum, p) => sum + (p.premiumDetails?.totalAnnualPremium || 0), 0);
        return (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold livishield-text-accent">{policiesWithPremiums.length}</p>
                <p className="text-sm livishield-text-secondary">Total Proposals</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {proposalService.formatCurrency(totalPremiumPaid)}
                </p>
                <p className="text-sm livishield-text-secondary">Active Policy Premiums</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {proposals.filter(p => p.status === 'approved').length}
                </p>
                <p className="text-sm livishield-text-secondary">Active Policies</p>
              </CardContent></Card>
            </div>

            {policiesWithPremiums.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 livishield-text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-medium livishield-text-primary mb-2">No Payment Records</h3>
                <p className="livishield-text-secondary mb-4">Submit a health insurance proposal to see premium details here.</p>
                <Button className="livishield-btn-primary" onClick={() => navigate('/health-insurance/plans')}>
                  Browse Health Plans
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold livishield-text-primary">Premium Summary</h3>
                {policiesWithPremiums.map((proposal) => (
                  <Card key={proposal._id} className="livishield-card">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold livishield-text-primary">{proposal.planId?.name}</h4>
                          <p className="text-xs livishield-text-secondary">{proposal.planId?.provider}</p>
                          <p className="text-xs livishield-text-secondary font-mono mt-1">{proposal.proposalNumber}</p>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(proposal.status)}`}>
                          {formatStatus(proposal.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="font-bold livishield-text-accent text-base">
                            {proposalService.formatCurrency(proposal.premiumDetails?.basePremium || 0)}
                          </p>
                          <p className="text-xs livishield-text-secondary">Base Premium/yr</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="font-bold livishield-text-accent text-base">
                            {proposalService.formatCurrency(proposal.premiumDetails?.addOnPremium || 0)}
                          </p>
                          <p className="text-xs livishield-text-secondary">Add-on Premium/yr</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3 text-center">
                          <p className="font-bold text-blue-700 text-base">
                            {proposalService.formatCurrency(proposal.premiumDetails?.totalAnnualPremium || 0)}
                          </p>
                          <p className="text-xs livishield-text-secondary">Total Annual</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3 text-center">
                          <p className="font-bold text-green-700 text-base">
                            {proposalService.formatCurrency(proposal.premiumDetails?.totalMonthlyPremium || 0)}
                          </p>
                          <p className="text-xs livishield-text-secondary">Monthly Est.</p>
                        </div>
                      </div>
                      {proposal.policyDetails?.policyNumber && (
                        <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
                          <span className="livishield-text-secondary">Policy Number:</span>
                          <span className="font-mono font-semibold livishield-text-primary">{proposal.policyDetails.policyNumber}</span>
                        </div>
                      )}
                      {proposal.submittedAt && (
                        <div className="flex items-center justify-between text-xs mt-1">
                          <span className="livishield-text-secondary">Submitted:</span>
                          <span className="livishield-text-primary">{proposalService.formatDate(proposal.submittedAt)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                  <p className="font-semibold mb-1">Payment Information</p>
                  <p className="text-xs">Premium payments are processed at policy issuance. Contact <a href="mailto:support@livishield.com" className="underline">support@livishield.com</a> for payment enquiries.</p>
                </div>
              </div>
            )}
          </div>
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