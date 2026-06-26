import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  ArrowLeft, CheckCircle, XCircle, AlertCircle, FileText,
  Shield, Clock, User, MapPin, Heart, Stethoscope,
  BadgeCheck, Copy, Loader2, Phone, Mail, Calendar
} from 'lucide-react';
import proposalService from '../services/proposalService';
import '../styles/theme.css';

const parseJSON = (v, fb) => {
  if (!v) return fb;
  if (typeof v === 'object') return v;
  try { return JSON.parse(v); } catch { return fb; }
};

const STATUS_CONFIG = {
  submitted:                  { color: 'bg-blue-100 text-blue-800',     label: 'Submitted',               icon: Clock },
  under_review:               { color: 'bg-yellow-100 text-yellow-800', label: 'Under Review',            icon: Clock },
  documents_required:         { color: 'bg-orange-100 text-orange-800', label: 'Documents Required',      icon: AlertCircle },
  documents_expired:          { color: 'bg-red-100 text-red-800',       label: 'Documents Expired',       icon: XCircle },
  medical_checkup_required:   { color: 'bg-purple-100 text-purple-800', label: 'Medical Checkup Required',icon: Stethoscope },
  approved:                   { color: 'bg-green-100 text-green-800',   label: 'Approved',                icon: CheckCircle },
  rejected:                   { color: 'bg-red-100 text-red-800',       label: 'Rejected',                icon: XCircle },
  policy_issued:              { color: 'bg-emerald-100 text-emerald-800',label: 'Policy Issued',          icon: BadgeCheck },
  cancelled:                  { color: 'bg-gray-100 text-gray-600',     label: 'Cancelled',               icon: XCircle },
};

const Row = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
    <span className="text-gray-500 shrink-0 mr-4">{label}</span>
    <span className="font-medium text-gray-800 text-right break-all">{value || '—'}</span>
  </div>
);

const Section = ({ icon: Icon, title, children }) => (
  <Card className="livishield-card">
    <CardContent className="p-5">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b">
        <Icon className="h-4 w-4 livishield-text-accent" />
        <h2 className="text-sm font-semibold livishield-text-primary">{title}</h2>
      </div>
      {children}
    </CardContent>
  </Card>
);

const ProposalDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [copied,   setCopied]   = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await proposalService.getProposalById(id);
        setProposal(data);
      } catch (e) {
        setError(e.message || 'Failed to load proposal');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin livishield-text-accent mx-auto mb-3" />
          <p className="text-sm livishield-text-secondary">Loading proposal...</p>
        </div>
      </div>
    </div>
  );

  if (error || !proposal) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <p className="font-medium text-gray-800 mb-4">{error || 'Proposal not found'}</p>
        <Button onClick={() => navigate('/dashboard')} className="livishield-btn-primary">
          <ArrowLeft className="h-4 w-4 mr-2" />Back to Dashboard
        </Button>
      </div>
    </div>
  );

  const pi      = parseJSON(proposal.personal_info, {});
  const pm      = parseJSON(proposal.premium_details, {});
  const mi      = parseJSON(proposal.medical_info, {});
  const docs    = parseJSON(proposal.required_documents, []);
  const history = parseJSON(proposal.status_history, []);
  const policy  = parseJSON(proposal.policy_details, null);
  const rejected= parseJSON(proposal.rejection_details, null);
  const addOns  = parseJSON(proposal.selected_add_ons, []);
  const family  = parseJSON(proposal.family_members, []);

  const cfg      = STATUS_CONFIG[proposal.status] || STATUS_CONFIG.submitted;
  const StatusIcon = cfg.icon;

  const needsUpload = ['submitted', 'documents_required'].includes(proposal.status);

  const handleCopy = () => {
    navigator.clipboard.writeText(proposal.proposal_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="livishield-gradient-bg text-white py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}
            className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 mb-4">
            <ArrowLeft className="h-4 w-4" />Back to Dashboard
          </Button>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{proposal.plan_name || 'Health Insurance Proposal'}</h1>
              <p className="text-white/80 text-sm mb-3">{proposal.plan_provider}</p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-white/70">Proposal No.</span>
                  <span className="font-mono font-bold text-sm">{proposal.proposal_number}</span>
                  <button onClick={handleCopy} className="text-white/60 hover:text-white">
                    {copied ? <CheckCircle className="h-3.5 w-3.5 text-green-300" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <Badge className={`text-xs border ${cfg.color} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />{cfg.label}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-xs">Total Annual Premium</p>
              <p className="text-2xl font-bold">{proposalService.formatCurrency(pm.totalAnnualPremium || 0)}</p>
              <p className="text-white/60 text-xs mt-0.5">Submitted {proposalService.formatDate(proposal.submitted_at)}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Status banners ── */}
        {policy && proposal.status === 'approved' && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="p-2 bg-green-100 rounded-lg shrink-0"><Shield className="h-5 w-5 text-green-600" /></div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">Policy Issued Successfully</p>
              <p className="text-xs text-green-700 mt-0.5">
                Policy No: <span className="font-mono font-bold">{policy.policyNumber}</span>
                {' · '}Valid: {proposalService.formatDate(policy.policyStartDate)} – {proposalService.formatDate(policy.policyEndDate)}
              </p>
            </div>
          </div>
        )}

        {rejected && proposal.status === 'rejected' && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="p-2 bg-red-100 rounded-lg shrink-0"><XCircle className="h-5 w-5 text-red-600" /></div>
            <div>
              <p className="text-sm font-semibold text-red-800">Proposal Rejected</p>
              <p className="text-xs text-red-700 mt-0.5">{rejected.reason}</p>
              {rejected.detailedReason && <p className="text-xs text-red-600 mt-1">{rejected.detailedReason}</p>}
            </div>
          </div>
        )}

        {proposal.status === 'under_review' && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="p-2 bg-blue-100 rounded-lg shrink-0"><Clock className="h-5 w-5 text-blue-600" /></div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Under Underwriting Review</p>
              <p className="text-xs text-blue-700 mt-0.5">Our team is reviewing your application and documents. This typically takes 2–3 business days.</p>
            </div>
          </div>
        )}

        {proposal.status === 'medical_checkup_required' && (
          <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="p-2 bg-purple-100 rounded-lg shrink-0"><Stethoscope className="h-5 w-5 text-purple-600" /></div>
            <div>
              <p className="text-sm font-semibold text-purple-800">Medical Checkup Required</p>
              <p className="text-xs text-purple-700 mt-0.5">Our team will contact you to schedule a medical examination before final approval.</p>
            </div>
          </div>
        )}

        {needsUpload && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg shrink-0"><AlertCircle className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-sm font-semibold text-amber-800">Documents still required</p>
                <p className="text-xs text-amber-700 mt-0.5">Upload your documents to proceed with your application.</p>
              </div>
            </div>
            <Button size="sm" className="livishield-btn-primary gap-1.5 shrink-0"
              onClick={() => navigate('/health-insurance/proposal-success', {
                state: {
                  proposalNumber: proposal.proposal_number, proposalId: proposal.id || id,
                  requiredDocuments: docs, planName: proposal.plan_name,
                  proposalStatus: proposal.status, submittedAt: proposal.submitted_at,
                }
              })}>
              Upload Documents
            </Button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-5">
          {/* ── LEFT (2 cols) ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Personal Info */}
            <Section icon={User} title="Applicant Information">
              <div className="grid sm:grid-cols-2 gap-x-8">
                <Row label="Full Name"  value={`${pi.firstName || ''} ${pi.lastName || ''}`.trim()} />
                <Row label="Email"      value={pi.email} />
                <Row label="Phone"      value={pi.phone} />
                <Row label="DOB"        value={pi.dateOfBirth ? new Date(pi.dateOfBirth).toLocaleDateString('en-IN') : null} />
                <Row label="Gender"     value={pi.gender ? pi.gender.charAt(0).toUpperCase() + pi.gender.slice(1) : null} />
              </div>
              {pi.address && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />Address
                  </p>
                  <p className="text-sm text-gray-700">
                    {pi.address.street}, {pi.address.city}, {pi.address.state} – {pi.address.pincode}
                  </p>
                </div>
              )}
            </Section>

            {/* Premium */}
            <Section icon={Shield} title="Premium Breakdown">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Base Premium/yr',  value: proposalService.formatCurrency(pm.basePremium || 0) },
                  { label: 'Add-on Premium',   value: proposalService.formatCurrency(pm.addOnPremium || 0) },
                  { label: 'Total Annual',     value: proposalService.formatCurrency(pm.totalAnnualPremium || 0), highlight: true },
                  { label: 'Monthly Est.',     value: proposalService.formatCurrency(pm.totalMonthlyPremium || 0) },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className={`rounded-lg p-3 text-center ${highlight ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <p className={`text-base font-bold ${highlight ? 'text-blue-700' : 'livishield-text-accent'}`}>{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Medical Info */}
            {mi && (
              <Section icon={Heart} title="Medical Information">
                <Row label="Pre-existing Conditions" value={Array.isArray(mi.preExistingConditions) ? mi.preExistingConditions.join(', ') : mi.preExistingConditions} />
                <Row label="Previous Insurance"      value={mi.previousInsurance ? 'Yes' : 'No'} />
                {mi.previousInsuranceDetails && <Row label="Previous Insurance Details" value={mi.previousInsuranceDetails} />}
                {mi.currentMedications && <Row label="Current Medications" value={mi.currentMedications} />}
                {mi.preferredHospitals  && <Row label="Preferred Hospitals"  value={mi.preferredHospitals} />}
              </Section>
            )}

            {/* Family Members */}
            {family.length > 0 && (
              <Section icon={User} title={`Family Members (${family.length})`}>
                <div className="space-y-2">
                  {family.map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{m.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{m.relationship} · {m.gender}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {m.dateOfBirth ? `${new Date().getFullYear() - new Date(m.dateOfBirth).getFullYear()} yrs` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Add-ons */}
            {addOns.length > 0 && (
              <Section icon={Shield} title="Selected Add-ons">
                <div className="space-y-2">
                  {addOns.map((a, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg text-sm">
                      <div>
                        <p className="font-medium text-gray-800">{a.name}</p>
                        {a.description && <p className="text-xs text-gray-500 mt-0.5">{a.description}</p>}
                      </div>
                      <p className="font-semibold livishield-text-accent shrink-0 ml-4">
                        +{proposalService.formatCurrency(a.premium)}/yr
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Documents */}
            <Section icon={FileText} title="Submitted Documents">
              <div className="space-y-2">
                {docs.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No documents uploaded yet</p>
                ) : docs.map((doc) => (
                  <div key={doc.type} className={`flex items-center justify-between p-3 rounded-lg border ${
                    doc.uploaded ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${doc.uploaded ? 'bg-green-100' : 'bg-gray-100'}`}>
                        {doc.uploaded ? <CheckCircle className="h-4 w-4 text-green-600" /> : <FileText className="h-4 w-4 text-gray-400" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{doc.name}</p>
                        {doc.uploaded && doc.fileName && <p className="text-xs text-green-600 truncate max-w-[200px]">{doc.fileName}</p>}
                        {!doc.uploaded && <p className={`text-xs ${doc.required ? 'text-orange-500' : 'text-gray-400'}`}>{doc.required ? 'Mandatory — not uploaded' : 'Optional'}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {doc.verificationStatus === 'verified' && (
                        <Badge className="text-xs bg-green-100 text-green-700 border-green-200">✓ Verified</Badge>
                      )}
                      {doc.verificationStatus === 'rejected' && (
                        <div className="text-right">
                          <Badge className="text-xs bg-red-100 text-red-700 border-red-200">✗ Rejected</Badge>
                          {doc.rejectionReason && <p className="text-xs text-red-600 mt-0.5 max-w-[140px]">{doc.rejectionReason}</p>}
                        </div>
                      )}
                      {doc.uploaded && !['verified','rejected'].includes(doc.verificationStatus) && (
                        <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">Pending Review</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          {/* ── RIGHT (1 col) ── */}
          <div className="space-y-4">

            {/* Policy details (if approved) */}
            {policy && (
              <Card className="livishield-card border-green-200">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                    <BadgeCheck className="h-3.5 w-3.5 text-green-600" />Policy Details
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400">Policy Number</p>
                      <p className="font-mono font-bold text-sm text-green-700">{policy.policyNumber}</p>
                    </div>
                    <Row label="Start Date" value={proposalService.formatDate(policy.policyStartDate)} />
                    <Row label="End Date"   value={proposalService.formatDate(policy.policyEndDate)} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status history */}
            <Card className="livishield-card">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />Status History
                </p>
                {history.length === 0 ? (
                  <p className="text-xs text-gray-400">No history yet</p>
                ) : (
                  <div className="relative">
                    <div className="absolute left-3 top-2 bottom-2 w-px bg-gray-200" />
                    <div className="space-y-3">
                      {[...history].reverse().map((h, i) => {
                        const hCfg = STATUS_CONFIG[h.status] || STATUS_CONFIG.submitted;
                        return (
                          <div key={i} className="flex gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 border-2 text-xs ${i === 0 ? 'livishield-bg-accent border-transparent text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                              {history.length - i}
                            </div>
                            <div className="flex-1 pb-1">
                              <Badge className={`text-xs border ${hCfg.color} mb-0.5`}>{hCfg.label}</Badge>
                              <p className="text-xs text-gray-400">{h.timestamp ? new Date(h.timestamp).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }) : ''}</p>
                              {h.comment && <p className="text-xs text-gray-500 mt-0.5 italic">{h.comment}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card className="livishield-card">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</p>
                <div className="space-y-2">
                  {needsUpload && (
                    <Button className="w-full livishield-btn-primary gap-2 text-sm"
                      onClick={() => navigate('/health-insurance/proposal-success', {
                        state: {
                          proposalNumber: proposal.proposal_number, proposalId: proposal.id || id,
                          requiredDocuments: docs, planName: proposal.plan_name,
                          proposalStatus: proposal.status, submittedAt: proposal.submitted_at,
                        }
                      })}>
                      <FileText className="h-4 w-4" />Upload Documents
                    </Button>
                  )}
                  <Button variant="outline" className="w-full gap-2 text-sm"
                    onClick={() => window.open(`mailto:support@livishield.com?subject=Proposal ${proposal.proposal_number}`)}>
                    <Mail className="h-4 w-4" />Email Support
                  </Button>
                  <Button variant="ghost" className="w-full gap-2 text-sm text-gray-600"
                    onClick={() => navigate('/health-insurance/plans')}>
                    Browse More Plans
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetail;
