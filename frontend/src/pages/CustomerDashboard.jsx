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
      if (!user?.id) throw new Error('User ID not found. Please log in again.');

      // Fetch proposals and payments in parallel
      const [dashData, paymentsData] = await Promise.allSettled([
        proposalService.getCustomerDashboard(user.id),
        paymentService.getUserPayments(),
      ]);

      if (dashData.status === 'fulfilled') {
        setProposals(dashData.value.proposals);
        setStats(dashData.value.stats);
      } else {
        throw new Error(dashData.reason?.message || 'Failed to load proposals');
      }
      if (paymentsData.status === 'fulfilled') {
        setPayments(paymentsData.value.data || []);
      }
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
            {proposal.status === 'approved' && proposal.payment_status !== 'paid' && (
              <Button
                size="sm" className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => navigate(`/proposals/${proposal._id}/pay`)}
              >
                <CreditCard className="h-4 w-4" />Pay Now
              </Button>
            )}
            {proposal.status === 'policy_issued' && (
              <Button size="sm" variant="outline" className="flex-1 gap-1.5 text-green-700 border-green-300">
                <BadgeCheck className="h-4 w-4" />Policy Active
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
        const paidPayments    = payments.filter(p => p.status === 'paid');
        const pendingPayments = proposals.filter(p =>
          p.status === 'approved' && p.payment_status !== 'paid'
        );
        const totalPaid = paidPayments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);

        return (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{paymentService.formatCurrency(totalPaid)}</p>
                <p className="text-sm livishield-text-secondary">Total Premiums Paid</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold livishield-text-accent">{paidPayments.length}</p>
                <p className="text-sm livishield-text-secondary">Successful Payments</p>
              </CardContent></Card>
              <Card><CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{pendingPayments.length}</p>
                <p className="text-sm livishield-text-secondary">Awaiting Payment</p>
              </CardContent></Card>
            </div>

            {/* Pending payments — Pay Now */}
            {pendingPayments.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold livishield-text-primary flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  Action Required — Pay Premium
                </h3>
                {pendingPayments.map(p => {
                  const pm   = p.premiumDetails || {};
                  const base = pm.totalAnnualPremium || 0;
                  const gst  = Math.round(base * 0.18 * 100) / 100;
                  const total= Math.round((base + gst) * 100) / 100;
                  return (
                    <Card key={p._id} className="border-amber-200 bg-amber-50 livishield-card">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-semibold livishield-text-primary">{p.planId?.name}</p>
                            <p className="text-xs livishield-text-secondary font-mono">{p.proposalNumber}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-600 flex-wrap">
                              <span>Net: {paymentService.formatCurrency(base)}</span>
                              <span className="text-amber-700">+ GST 18%: {paymentService.formatCurrency(gst)}</span>
                              <span className="font-bold livishield-text-accent">Total: {paymentService.formatCurrency(total)}</span>
                            </div>
                          </div>
                          <Button size="sm" className="livishield-btn-primary gap-1.5 shrink-0"
                            onClick={() => navigate(`/proposals/${p._id}/pay`)}>
                            <CreditCard className="h-3.5 w-3.5" />Pay Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Payment history */}
            <div className="space-y-3">
              <h3 className="font-semibold livishield-text-primary">Payment History</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 livishield-border-accent mx-auto mb-3" />
                  <p className="text-sm livishield-text-secondary">Loading payments...</p>
                </div>
              ) : paidPayments.length === 0 ? (
                <div className="text-center py-10">
                  <CreditCard className="h-10 w-10 livishield-text-secondary mx-auto mb-3" />
                  <p className="font-medium livishield-text-primary mb-1">No payments yet</p>
                  <p className="text-sm livishield-text-secondary">
                    {pendingPayments.length > 0
                      ? 'You have approved proposals above waiting for payment.'
                      : 'Payments will appear here once a proposal is approved and paid.'}
                  </p>
                </div>
              ) : (
                paidPayments.map(pay => {
                  const gst   = Math.round(parseFloat(pay.amount) * (18/118) * 100) / 100;
                  const net   = Math.round((parseFloat(pay.amount) - gst) * 100) / 100;
                  return (
                    <Card key={pay.id} className="livishield-card">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold livishield-text-primary">{pay.planName}</p>
                            <p className="text-xs livishield-text-secondary">{pay.planProvider}</p>
                            <p className="text-xs livishield-text-secondary font-mono mt-0.5">{pay.proposalNumber}</p>
                          </div>
                          <Badge className="text-xs bg-green-100 text-green-700 border-green-200 gap-1 shrink-0">
                            <CheckCircle className="h-3 w-3" />Paid
                          </Badge>
                        </div>

                        {/* GST breakdown */}
                        <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1.5 mb-3">
                          <div className="flex justify-between text-gray-500">
                            <span>Net Premium</span><span>{paymentService.formatCurrency(net)}</span>
                          </div>
                          <div className="flex justify-between text-amber-700">
                            <span>GST (18%)</span><span>+{paymentService.formatCurrency(gst)}</span>
                          </div>
                          <div className="flex justify-between font-bold border-t pt-1.5 text-sm">
                            <span className="livishield-text-primary">Total Paid</span>
                            <span className="livishield-text-accent">{paymentService.formatCurrency(pay.amount)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
                          <span>
                            {pay.paymentMethod && (
                              <span className="capitalize bg-gray-100 rounded px-2 py-0.5 mr-2">{pay.paymentMethod}</span>
                            )}
                            {pay.paidAt && new Date(pay.paidAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                          </span>
                          {pay.razorpayPaymentId && (
                            <span className="font-mono text-gray-400 truncate max-w-[200px]">{pay.razorpayPaymentId}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            <p className="text-xs text-center text-gray-400 pb-2">
              All amounts include 18% GST as per IRDAI mandate · Powered by Razorpay
            </p>
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