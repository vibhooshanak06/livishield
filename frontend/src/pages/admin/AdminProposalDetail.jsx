import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  ArrowLeft, CheckCircle, XCircle, AlertCircle, FileText,
  User, MapPin, Heart, Clock, Shield, Stethoscope,
  Loader2, RefreshCw, Activity, Database
} from 'lucide-react';
import adminService from '../../services/adminService';
import '../../styles/theme.css';

/* ─────────────────── Reusable Modal ─────────────────── */
const Modal = ({ title, children, onClose, footer }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h3 className="text-sm font-semibold livishield-text-primary">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
      </div>
      <div className="px-5 py-4">{children}</div>
      {footer && <div className="px-5 py-3 border-t flex justify-end gap-2">{footer}</div>}
    </div>
  </div>
);

/* ─────────────────── Section wrapper ─────────────────── */
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

/* ─────────────────── Info row ─────────────────── */
const Row = ({ label, value }) => (
  <div className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
    <span className="text-gray-500 shrink-0 mr-4">{label}</span>
    <span className="font-medium text-gray-800 text-right break-all">{value || '—'}</span>
  </div>
);

/* ─────────────────── Document Card ─────────────────── */
const DocCard = ({ doc, proposalId, locked, onVerified, onRejected }) => {
  const [busy,       setBusy]       = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason,     setReason]     = useState('');
  const [err,        setErr]        = useState(null);

  const borderClass = {
    verified:     'border-green-200 bg-green-50',
    rejected:     'border-red-200 bg-red-50',
    under_review: 'border-yellow-200 bg-yellow-50',
    pending:      'border-gray-200 bg-white',
    not_uploaded: 'border-dashed border-gray-200 bg-gray-50',
  };

  const handleVerify = async () => {
    setBusy(true); setErr(null);
    try {
      await adminService.verifyDocument(proposalId, doc.type);
      onVerified(doc.type);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const handleReject = async () => {
    if (!reason.trim()) { setErr('Reason is required.'); return; }
    setBusy(true); setErr(null);
    try {
      await adminService.rejectDocument(proposalId, doc.type, reason);
      onRejected(doc.type, reason);
      setShowReject(false); setReason('');
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  const vs = doc.verificationStatus;

  return (
    <div className={`rounded-lg border p-3 ${borderClass[vs] || borderClass.pending}`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${doc.uploaded ? 'bg-white border' : 'bg-gray-100'}`}>
          {vs === 'verified' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
           vs === 'rejected' ? <XCircle     className="h-4 w-4 text-red-500"   /> :
           doc.uploaded      ? <FileText    className="h-4 w-4 text-blue-500"  /> :
                               <FileText    className="h-4 w-4 text-gray-400"  />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">{doc.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <Badge className={`text-xs border ${
              vs === 'verified'     ? 'bg-green-100 text-green-700 border-green-200'   :
              vs === 'rejected'     ? 'bg-red-100 text-red-700 border-red-200'         :
              vs === 'under_review' ? 'bg-yellow-100 text-yellow-700 border-yellow-200':
              doc.uploaded          ? 'bg-blue-100 text-blue-700 border-blue-200'      :
                                      'bg-gray-100 text-gray-500 border-gray-200'
            }`}>
              {vs === 'not_uploaded' ? 'Not Uploaded' : vs?.replace(/_/g, ' ') || 'Pending'}
            </Badge>
            {doc.required && <span className="text-xs text-red-500">Mandatory</span>}
          </div>
          {doc.fileName        && <p className="text-xs text-gray-400 mt-0.5 truncate">{doc.fileName} {doc.fileSize ? `· ${(doc.fileSize / 1024).toFixed(0)} KB` : ''}</p>}
          {doc.rejectionReason && <p className="text-xs text-red-600 mt-1">Reason: {doc.rejectionReason}</p>}
          {doc.verifiedBy      && <p className="text-xs text-green-600 mt-0.5">Verified by admin #{doc.verifiedBy} · {adminService.formatDate(doc.verifiedAt)}</p>}
        </div>
        {!locked && doc.uploaded && vs !== 'verified' && (
          <div className="flex gap-1.5 shrink-0">
            <Button size="sm" onClick={handleVerify} disabled={busy}
              className="h-7 text-xs bg-green-600 hover:bg-green-700 text-white gap-1">
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}Verify
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowReject(true)} disabled={busy}
              className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 gap-1">
              <XCircle className="h-3 w-3" />Reject
            </Button>
          </div>
        )}
      </div>
      {err && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{err}</p>}
      {showReject && (
        <div className="mt-3 pt-3 border-t">
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={2}
            placeholder="Reason for rejection (shown to customer)..."
            className="w-full text-xs border border-red-200 rounded-lg p-2 focus:ring-1 focus:ring-red-400 resize-none" />
          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={handleReject} disabled={busy}
              className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white">
              {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Confirm Reject'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowReject(false); setReason(''); }}
              className="h-7 text-xs">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─────────────────── Status History Timeline ─────────────────── */
const StatusTimeline = ({ history }) => (
  <div className="relative">
    <div className="absolute left-3.5 top-4 bottom-0 w-px bg-gray-200" />
    <div className="space-y-4">
      {[...history].reverse().map((h, i) => (
        <div key={i} className="flex gap-3 relative">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 border-2 text-xs font-bold ${
            i === 0 ? 'livishield-bg-accent border-transparent text-white' : 'bg-white border-gray-200 text-gray-400'
          }`}>
            {history.length - i}
          </div>
          <div className="flex-1 pb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={`text-xs border ${adminService.statusColor(h.status)}`}>
                {adminService.statusLabel(h.status)}
              </Badge>
              <span className="text-xs text-gray-400">{adminService.formatDateTime(h.timestamp)}</span>
            </div>
            {h.comment   && <p className="text-xs text-gray-600 mt-0.5">{h.comment}</p>}
            {h.updatedBy && <p className="text-xs text-gray-400">by {h.updatedBy}</p>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

/* ─────────────────── Audit Log (MongoDB) ─────────────────── */
const EVENT_COLORS = {
  uploaded:    'bg-blue-100 text-blue-700 border-blue-200',
  re_uploaded: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  deleted:     'bg-red-100 text-red-700 border-red-200',
  submitted:   'bg-green-100 text-green-700 border-green-200',
  verified:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  rejected:    'bg-orange-100 text-orange-700 border-orange-200',
  reset:       'bg-yellow-100 text-yellow-700 border-yellow-200',
};

const EVENT_ICONS = {
  uploaded:    '⬆',
  re_uploaded: '🔄',
  deleted:     '🗑',
  submitted:   '✅',
  verified:    '✔',
  rejected:    '✗',
  reset:       '↺',
};

const AuditLogTab = ({ proposalId }) => {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [offline, setOffline] = useState(false);

  const fetchAudit = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await adminService.getAuditLog(proposalId);
      if (res.message?.includes('offline')) {
        setOffline(true);
        setEvents([]);
      } else {
        setEvents(res.data || []);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  useEffect(() => { fetchAudit(); }, [fetchAudit]);

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className="h-7 w-7 animate-spin livishield-text-accent" />
    </div>
  );

  if (offline) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Database className="h-10 w-10 text-gray-300 mb-3" />
      <p className="text-sm font-medium text-gray-600 mb-1">Audit Log Offline</p>
      <p className="text-xs text-gray-400 max-w-sm">
        MongoDB is not connected. Audit events are not available.
        The rest of the application is working normally.
      </p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertCircle className="h-10 w-10 text-red-400 mb-3" />
      <p className="text-sm text-red-600 mb-3">{error}</p>
      <Button size="sm" variant="outline" onClick={fetchAudit}>Retry</Button>
    </div>
  );

  if (events.length === 0) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Activity className="h-10 w-10 text-gray-300 mb-3" />
      <p className="text-sm font-medium text-gray-600 mb-1">No Audit Events Yet</p>
      <p className="text-xs text-gray-400">Events will appear here as documents are uploaded and verified.</p>
    </div>
  );

  // Group by docType for easier reading
  const grouped = events.reduce((acc, e) => {
    const key = e.docType;
    if (!acc[key]) acc[key] = { docName: e.docName, events: [] };
    acc[key].events.push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Events',   value: events.length },
          { label: 'Uploads',        value: events.filter(e => ['uploaded','re_uploaded'].includes(e.event)).length },
          { label: 'Verifications',  value: events.filter(e => e.event === 'verified').length },
          { label: 'Rejections',     value: events.filter(e => e.event === 'rejected').length },
        ].map(s => (
          <Card key={s.label} className="livishield-card">
            <CardContent className="p-3 text-center">
              <p className="text-xl font-bold livishield-text-primary">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-document timeline */}
      {Object.entries(grouped).map(([docType, { docName, events: docEvents }]) => (
        <Card key={docType} className="livishield-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b">
              <FileText className="h-4 w-4 livishield-text-accent" />
              <p className="text-sm font-semibold livishield-text-primary">{docName}</p>
              <Badge className="text-xs bg-gray-100 text-gray-600 border-gray-200 ml-auto">
                {docEvents.length} event{docEvents.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="relative">
              <div className="absolute left-3 top-4 bottom-0 w-px bg-gray-100" />
              <div className="space-y-3">
                {docEvents.map((ev, i) => (
                  <div key={ev._id || i} className="flex gap-3 relative">
                    {/* Icon dot */}
                    <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shrink-0 z-10 text-xs">
                      {EVENT_ICONS[ev.event] || '•'}
                    </div>
                    <div className="flex-1 min-w-0 pb-1">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <Badge className={`text-xs border capitalize ${EVENT_COLORS[ev.event] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                          {ev.event.replace(/_/g, ' ')}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {adminService.formatDateTime(ev.timestamp)}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          ev.actorRole === 'admin' ? 'bg-purple-100 text-purple-600' :
                          ev.actorRole === 'system'? 'bg-gray-100 text-gray-500' :
                                                     'bg-blue-100 text-blue-600'
                        }`}>
                          {ev.actorRole}
                        </span>
                      </div>

                      {/* File details on upload events */}
                      {ev.fileDetails?.fileName && (
                        <p className="text-xs text-gray-500 truncate">
                          📄 {ev.fileDetails.fileName}
                          {ev.fileDetails.fileSize ? ` · ${(ev.fileDetails.fileSize / 1024).toFixed(0)} KB` : ''}
                        </p>
                      )}

                      {/* Previous state on re-upload/delete */}
                      {ev.previousState?.fileName && (
                        <p className="text-xs text-gray-400 truncate">
                          Replaced: {ev.previousState.fileName}
                        </p>
                      )}

                      {/* Rejection reason */}
                      {ev.rejectionReason && (
                        <p className="text-xs text-red-600 mt-0.5">
                          Reason: {ev.rejectionReason}
                        </p>
                      )}

                      {/* Comment */}
                      {ev.comment && (
                        <p className="text-xs text-gray-500 mt-0.5 italic">{ev.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <p className="text-xs text-center text-gray-400 pb-2">
        Audit log powered by MongoDB — immutable, append-only (IRDAI compliant)
      </p>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════
   Main Component
══════════════════════════════════════════════════════════════ */
const AdminProposalDetail = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [proposal,     setProposal]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [actionBusy,   setActionBusy]   = useState(false);
  const [actionError,  setActionError]  = useState(null);
  const [successMsg,   setSuccessMsg]   = useState(null);
  const [activeTab,    setActiveTab]    = useState('overview'); // 'overview' | 'documents' | 'audit'

  // Modal state
  const [modal,            setModal]            = useState(null);
  const [modalComment,     setModalComment]     = useState('');
  const [rejectReason,     setRejectReason]     = useState('');
  const [rejectDetail,     setRejectDetail]     = useState('');
  const [selectedDocTypes, setSelectedDocTypes] = useState([]);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await adminService.getProposalDetail(id);
      setProposal(res.data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const flash = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  /* ── Action handlers ── */
  const handleApprove = async () => {
    setActionBusy(true); setActionError(null);
    try {
      await adminService.approveProposal(id, { comment: modalComment || undefined });
      flash('✓ Proposal approved and policy generated successfully.');
      closeModal();
      load();
    } catch (e) { setActionError(e.message); }
    finally { setActionBusy(false); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { setActionError('Rejection reason is required.'); return; }
    setActionBusy(true); setActionError(null);
    try {
      await adminService.rejectProposal(id, { reason: rejectReason, detailedReason: rejectDetail, comment: rejectReason });
      flash('Proposal rejected.');
      closeModal();
      load();
    } catch (e) { setActionError(e.message); }
    finally { setActionBusy(false); }
  };

  const handleRequestDocs = async () => {
    setActionBusy(true); setActionError(null);
    try {
      await adminService.requestDocuments(id, { docTypes: selectedDocTypes, comment: modalComment || 'Additional documents required.' });
      flash('Customer notified to re-upload documents.');
      closeModal();
      load();
    } catch (e) { setActionError(e.message); }
    finally { setActionBusy(false); }
  };

  const handleMedical = async () => {
    setActionBusy(true); setActionError(null);
    try {
      await adminService.requireMedicalCheckup(id, { comment: modalComment || undefined });
      flash('Medical checkup required status set.');
      closeModal();
      load();
    } catch (e) { setActionError(e.message); }
    finally { setActionBusy(false); }
  };

  const handleDocVerified = (docType) => {
    setProposal(prev => ({
      ...prev,
      documents: prev.documents.map(d =>
        d.type === docType ? { ...d, verificationStatus: 'verified', verifiedAt: new Date(), verifiedBy: 'you' } : d
      ),
    }));
  };

  const handleDocRejected = (docType, reason) => {
    setProposal(prev => ({
      ...prev,
      documents: prev.documents.map(d =>
        d.type === docType ? { ...d, verificationStatus: 'rejected', rejectionReason: reason } : d
      ),
    }));
  };

  const closeModal = () => {
    setModal(null); setActionError(null);
    setModalComment(''); setRejectReason(''); setRejectDetail('');
    setSelectedDocTypes([]);
  };

  /* ── Loading / error states ── */
  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin livishield-text-accent" />
    </div>
  );

  if (error || !proposal) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <p className="text-sm text-gray-600 mb-4">{error || 'Proposal not found'}</p>
        <Button onClick={() => navigate('/admin')} variant="outline" className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />Back to Dashboard
        </Button>
      </div>
    </div>
  );

  const p   = proposal;
  const pi  = p.personalInfo || {};

  const locked         = ['approved','rejected','policy_issued','cancelled'].includes(p.status);
  const canApprove     = ['under_review','medical_checkup_required'].includes(p.status);
  const canReject      = !locked;
  const canRequestDocs = ['under_review','submitted','documents_required'].includes(p.status);
  const canMedical     = p.status === 'under_review';

  const mandatoryDocs     = (p.documents || []).filter(d => d.required);
  const allDocsVerified   = mandatoryDocs.length > 0 && mandatoryDocs.every(d => d.verificationStatus === 'verified');
  const uploadedCount     = (p.documents || []).filter(d => d.uploaded).length;
  const verifiedCount     = (p.documents || []).filter(d => d.verificationStatus === 'verified').length;

  const TABS = [
    { id: 'overview',  label: 'Overview',  icon: Shield },
    { id: 'documents', label: `Documents (${uploadedCount}/${p.documents?.length || 0})`, icon: FileText },
    { id: 'audit',     label: 'Audit Log', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <header className="livishield-gradient-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin')}
            className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5">
            <ArrowLeft className="h-4 w-4" />Dashboard
          </Button>
          <div className="h-5 w-px bg-white/20" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{p.proposalNumber}</p>
            <p className="text-white/60 text-xs truncate">{pi.firstName} {pi.lastName} · {p.plan?.name}</p>
          </div>
          <Badge className={`text-xs border shrink-0 ${adminService.statusColor(p.status)}`}>
            {adminService.statusLabel(p.status)}
          </Badge>
          <Button variant="ghost" size="sm" onClick={load}
            className="text-white/70 hover:text-white hover:bg-white/10">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Success banner ── */}
        {successMsg && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 mb-4 text-sm text-green-800">
            <CheckCircle className="h-4 w-4 shrink-0" />{successMsg}
          </div>
        )}

        {/* ── Action bar ── */}
        {!locked && (
          <div className="flex flex-wrap gap-2 mb-5 p-4 bg-white rounded-xl border livishield-card">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide w-full mb-1">Admin Actions</p>

            {canApprove && (
              <Button onClick={() => setModal('approve')} disabled={!allDocsVerified}
                className="gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm">
                <CheckCircle className="h-4 w-4" />Approve Proposal
              </Button>
            )}
            {canApprove && !allDocsVerified && (
              <p className="text-xs text-amber-600 flex items-center gap-1 self-center">
                <AlertCircle className="h-3.5 w-3.5" />
                Verify all mandatory documents first ({verifiedCount}/{mandatoryDocs.length} verified)
              </p>
            )}
            {canReject && (
              <Button onClick={() => setModal('reject')} variant="outline"
                className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 text-sm">
                <XCircle className="h-4 w-4" />Reject
              </Button>
            )}
            {canRequestDocs && (
              <Button onClick={() => setModal('request_docs')} variant="outline"
                className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50 text-sm">
                <FileText className="h-4 w-4" />Request Documents
              </Button>
            )}
            {canMedical && (
              <Button onClick={() => setModal('medical')} variant="outline"
                className="gap-1.5 text-purple-600 border-purple-200 hover:bg-purple-50 text-sm">
                <Stethoscope className="h-4 w-4" />Require Medical Checkup
              </Button>
            )}
          </div>
        )}

        {/* ── Approved banner ── */}
        {p.status === 'approved' && p.policyDetails && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
            <Shield className="h-6 w-6 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">Policy Issued</p>
              <p className="text-xs text-green-700">
                Policy No: <span className="font-mono font-bold">{p.policyDetails.policyNumber}</span>
                {' · '}Valid: {adminService.formatDate(p.policyDetails.policyStartDate)} – {adminService.formatDate(p.policyDetails.policyEndDate)}
              </p>
            </div>
          </div>
        )}

        {/* ── Rejected banner ── */}
        {p.status === 'rejected' && p.rejectionDetails && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
            <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-800">Proposal Rejected</p>
              <p className="text-xs text-red-700 mt-0.5">{p.rejectionDetails.reason}</p>
              {p.rejectionDetails.detailedReason && <p className="text-xs text-red-600 mt-1">{p.rejectionDetails.detailedReason}</p>}
            </div>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex gap-1 overflow-x-auto">
            {TABS.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 livishield-text-accent'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />{tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ═══════════ TAB: OVERVIEW ═══════════ */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-5">
            {/* ── LEFT ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Personal */}
              <Section icon={User} title="Applicant Information">
                <div className="grid sm:grid-cols-2 gap-x-8">
                  <Row label="Full Name"     value={`${pi.firstName || ''} ${pi.lastName || ''}`.trim()} />
                  <Row label="Email"         value={pi.email} />
                  <Row label="Phone"         value={pi.phone} />
                  <Row label="Date of Birth" value={adminService.formatDate(pi.dateOfBirth)} />
                  <Row label="Gender"        value={pi.gender} />
                </div>
                {pi.address && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />Address
                    </p>
                    <p className="text-sm text-gray-700">
                      {pi.address.street}, {pi.address.city}, {pi.address.state} – {pi.address.pincode}
                    </p>
                  </div>
                )}
              </Section>

              {/* Plan */}
              <Section icon={Shield} title="Plan Details">
                <div className="grid sm:grid-cols-2 gap-x-8">
                  <Row label="Plan Name"         value={p.plan?.name} />
                  <Row label="Provider"          value={p.plan?.provider} />
                  <Row label="Type"              value={p.plan?.type} />
                  <Row label="Sum Insured"        value={adminService.formatCurrency(p.plan?.sumInsured)} />
                  <Row label="Annual Premium"    value={adminService.formatCurrency(p.premiumDetails?.totalAnnualPremium)} />
                  <Row label="Monthly Premium"   value={adminService.formatCurrency(p.premiumDetails?.totalMonthlyPremium)} />
                  <Row label="Claim Ratio"       value={p.plan?.claimSettlementRatio ? `${p.plan.claimSettlementRatio}%` : null} />
                  <Row label="Network Hospitals" value={p.plan?.networkHospitals?.toLocaleString('en-IN')} />
                </div>
                {p.selectedAddOns?.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Selected Add-ons</p>
                    {p.selectedAddOns.map(a => (
                      <div key={a.name} className="flex justify-between text-sm py-0.5">
                        <span className="text-gray-600">{a.name}</span>
                        <span className="font-medium livishield-text-accent">+{adminService.formatCurrency(a.premium)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </Section>

              {/* Medical */}
              <Section icon={Heart} title="Medical Information">
                <Row label="Pre-existing Conditions" value={p.medicalInfo?.preExistingConditions?.join(', ') || 'None'} />
                <Row label="Current Medications"     value={p.medicalInfo?.currentMedications || 'None'} />
                <Row label="Previous Insurance"      value={p.medicalInfo?.previousInsurance ? 'Yes' : 'No'} />
                {p.medicalInfo?.previousInsuranceDetails && <Row label="Previous Details" value={p.medicalInfo.previousInsuranceDetails} />}
                {p.medicalInfo?.preferredHospitals   && <Row label="Preferred Hospitals" value={p.medicalInfo.preferredHospitals} />}
                {p.medicalInfo?.additionalRequirements && <Row label="Additional Notes"   value={p.medicalInfo.additionalRequirements} />}
              </Section>

              {/* Family members */}
              {p.familyMembers?.length > 0 && (
                <Section icon={User} title={`Family Members (${p.familyMembers.length})`}>
                  <div className="space-y-2">
                    {p.familyMembers.map((m, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-gray-500 capitalize text-xs">
                          {m.relationship} · {m.gender} · {new Date().getFullYear() - new Date(m.dateOfBirth).getFullYear()} yrs
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>

            {/* ── RIGHT sidebar ── */}
            <div className="space-y-5">
              <Card className="livishield-card">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Proposal Summary</p>
                  <div className="space-y-1">
                    <Row label="Proposal #"   value={p.proposalNumber} />
                    <Row label="Submitted"    value={adminService.formatDateTime(p.submittedAt)} />
                    <Row label="Last Updated" value={adminService.formatDateTime(p.updatedAt)} />
                    <Row label="Status"       value={adminService.statusLabel(p.status)} />
                    <Row label="Docs Uploaded" value={`${uploadedCount} / ${p.documents?.length || 0}`} />
                    <Row label="Docs Verified" value={`${verifiedCount} / ${mandatoryDocs.length} mandatory`} />
                    {p.assignedAgent?.agentName && <Row label="Agent" value={p.assignedAgent.agentName} />}
                  </div>
                </CardContent>
              </Card>

              <Card className="livishield-card">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />Status History
                  </p>
                  {p.statusHistory?.length > 0
                    ? <StatusTimeline history={p.statusHistory} />
                    : <p className="text-xs text-gray-400">No history yet.</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ═══════════ TAB: DOCUMENTS ═══════════ */}
        {activeTab === 'documents' && (
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-3">
              {(p.documents || []).length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No documents required for this proposal.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold livishield-text-primary">Document Verification</p>
                    <span className="text-xs text-gray-500">{verifiedCount}/{p.documents?.length || 0} verified</span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${verifiedCount === (p.documents?.length || 0) ? 'bg-green-500' : 'livishield-bg-accent'}`}
                      style={{ width: `${p.documents?.length ? (verifiedCount / p.documents.length) * 100 : 0}%` }}
                    />
                  </div>

                  {/* Mandatory docs */}
                  {mandatoryDocs.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mandatory Documents</p>
                      {mandatoryDocs.map(doc => (
                        <DocCard key={doc.type} doc={doc} proposalId={p.id}
                          locked={locked} onVerified={handleDocVerified} onRejected={handleDocRejected} />
                      ))}
                    </div>
                  )}

                  {/* Optional docs */}
                  {(p.documents || []).filter(d => !d.required).length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Optional Documents</p>
                      {(p.documents || []).filter(d => !d.required).map(doc => (
                        <DocCard key={doc.type} doc={doc} proposalId={p.id}
                          locked={locked} onVerified={handleDocVerified} onRejected={handleDocRejected} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar: doc tips */}
            <div className="space-y-4">
              <Card className="livishield-card">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Verification Guide</p>
                  <ul className="text-xs text-gray-600 space-y-2">
                    <li className="flex gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />Check document is clear, readable, and not blurred</li>
                    <li className="flex gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />Verify name and DOB match applicant's personal info</li>
                    <li className="flex gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />All four corners visible and not cropped</li>
                    <li className="flex gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />Document is valid (not expired)</li>
                    <li className="flex gap-1.5"><CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />Government-issued or officially notarised</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-amber-800 mb-2">⚠ Verification Rules</p>
                  <ul className="text-xs text-amber-700 space-y-1.5">
                    <li>• Verify ALL mandatory documents before approving</li>
                    <li>• Rejected documents must have a clear reason</li>
                    <li>• Documents locked once proposal is approved/rejected</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ═══════════ TAB: AUDIT LOG ═══════════ */}
        {activeTab === 'audit' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold livishield-text-primary flex items-center gap-2">
                  <Activity className="h-4 w-4 livishield-text-accent" />Document Audit Trail
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Immutable event log from MongoDB — every upload, verification, and admin action
                </p>
              </div>
            </div>
            <AuditLogTab proposalId={p.id} />
          </div>
        )}
      </div>

      {/* ══════════════ MODALS ══════════════ */}

      {/* Approve */}
      {modal === 'approve' && (
        <Modal title="Approve Proposal" onClose={closeModal} footer={
          <>
            <Button variant="outline" onClick={closeModal} className="text-sm">Cancel</Button>
            <Button onClick={handleApprove} disabled={actionBusy}
              className="bg-green-600 hover:bg-green-700 text-white text-sm gap-1.5">
              {actionBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              Confirm Approval
            </Button>
          </>
        }>
          <p className="text-sm text-gray-600 mb-3">
            Approving this proposal will generate a policy number. All documents have been verified.
          </p>
          <label className="block text-xs font-medium text-gray-600 mb-1">Comment (optional)</label>
          <textarea value={modalComment} onChange={e => setModalComment(e.target.value)} rows={2}
            placeholder="Internal approval note..."
            className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 livishield-focus-ring resize-none" />
          {actionError && <p className="mt-2 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{actionError}</p>}
        </Modal>
      )}

      {/* Reject */}
      {modal === 'reject' && (
        <Modal title="Reject Proposal" onClose={closeModal} footer={
          <>
            <Button variant="outline" onClick={closeModal} className="text-sm">Cancel</Button>
            <Button onClick={handleReject} disabled={actionBusy}
              className="bg-red-600 hover:bg-red-700 text-white text-sm gap-1.5">
              {actionBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
              Confirm Rejection
            </Button>
          </>
        }>
          <p className="text-sm text-gray-600 mb-3">This action is permanent and cannot be undone.</p>
          <label className="block text-xs font-medium text-gray-600 mb-1">Reason <span className="text-red-500">*</span></label>
          <input value={rejectReason} onChange={e => setRejectReason(e.target.value)}
            placeholder="e.g. High-risk medical history, document mismatch"
            className="w-full text-sm border border-gray-300 rounded-lg p-2 mb-3 focus:ring-2 livishield-focus-ring" />
          <label className="block text-xs font-medium text-gray-600 mb-1">Detailed explanation (optional)</label>
          <textarea value={rejectDetail} onChange={e => setRejectDetail(e.target.value)} rows={2}
            placeholder="Additional context for the customer..."
            className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 livishield-focus-ring resize-none" />
          {actionError && <p className="mt-2 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{actionError}</p>}
        </Modal>
      )}

      {/* Request documents */}
      {modal === 'request_docs' && (
        <Modal title="Request Re-upload" onClose={closeModal} footer={
          <>
            <Button variant="outline" onClick={closeModal} className="text-sm">Cancel</Button>
            <Button onClick={handleRequestDocs} disabled={actionBusy}
              className="livishield-btn-primary text-sm gap-1.5">
              {actionBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Send Request
            </Button>
          </>
        }>
          <p className="text-sm text-gray-600 mb-3">Select which documents need to be re-uploaded by the customer.</p>
          <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
            {(p.documents || []).map(doc => (
              <label key={doc.type} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                <input type="checkbox"
                  checked={selectedDocTypes.includes(doc.type)}
                  onChange={e => setSelectedDocTypes(prev =>
                    e.target.checked ? [...prev, doc.type] : prev.filter(t => t !== doc.type)
                  )}
                  className="rounded" />
                <span className="text-sm flex-1">{doc.name}</span>
                {doc.required && <span className="text-xs text-red-500">Mandatory</span>}
              </label>
            ))}
          </div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Message to customer</label>
          <textarea value={modalComment} onChange={e => setModalComment(e.target.value)} rows={2}
            placeholder="Explain what needs to be corrected..."
            className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 livishield-focus-ring resize-none" />
          {actionError && <p className="mt-2 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{actionError}</p>}
        </Modal>
      )}

      {/* Medical checkup */}
      {modal === 'medical' && (
        <Modal title="Require Medical Checkup" onClose={closeModal} footer={
          <>
            <Button variant="outline" onClick={closeModal} className="text-sm">Cancel</Button>
            <Button onClick={handleMedical} disabled={actionBusy}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm gap-1.5">
              {actionBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Stethoscope className="h-4 w-4" />}
              Confirm
            </Button>
          </>
        }>
          <p className="text-sm text-gray-600 mb-3">
            The customer will be notified that a medical checkup is required before the proposal can be approved.
          </p>
          <label className="block text-xs font-medium text-gray-600 mb-1">Instructions (optional)</label>
          <textarea value={modalComment} onChange={e => setModalComment(e.target.value)} rows={2}
            placeholder="e.g. Please visit a NABL-accredited diagnostic centre..."
            className="w-full text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 livishield-focus-ring resize-none" />
          {actionError && <p className="mt-2 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3.5 w-3.5" />{actionError}</p>}
        </Modal>
      )}

    </div>
  );
};

export default AdminProposalDetail;
