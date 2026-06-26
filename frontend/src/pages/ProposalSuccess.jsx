import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback, useRef } from 'react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  CheckCircle, FileText, Upload, Phone, Mail, Calendar,
  ArrowRight, Clock, AlertCircle, LayoutDashboard,
  ShieldCheck, UserCheck, Stethoscope, BadgeCheck, Copy,
  XCircle, RefreshCw, Trash2, Loader2
} from 'lucide-react';
import proposalService from '../services/proposalService';
import '../styles/theme.css';

/* ─────────────────────────────────────────────
   DocUploadCard — per-document upload widget
───────────────────────────────────────────── */
const DocUploadCard = ({ doc, proposalId, disabled, onUploaded, onDeleted }) => {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [localDoc, setLocalDoc] = useState(doc);

  useEffect(() => { setLocalDoc(doc); }, [doc]);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowed.includes(file.type)) { setError('Only PDF, JPG, PNG allowed.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('File must be under 5 MB.'); return; }
    setError(null); setUploading(true); setProgress(0);
    try {
      const result = await proposalService.uploadDocument(
        proposalId, localDoc.type, file,
        (loaded, total) => setProgress(Math.round((loaded / total) * 100))
      );
      setLocalDoc(prev => ({ ...prev, uploaded: true, fileName: file.name, fileSize: file.size }));
      onUploaded?.(result);
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false); setProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [localDoc, proposalId, onUploaded]);

  const handleDelete = useCallback(async () => {
    setDeleting(true); setError(null);
    try {
      await proposalService.deleteDocument(proposalId, localDoc.type);
      setLocalDoc(prev => ({ ...prev, uploaded: false, fileName: undefined, fileSize: undefined }));
      onDeleted?.(localDoc.type);
    } catch (err) {
      setError(err.message || 'Could not remove file.');
    } finally { setDeleting(false); }
  }, [localDoc, proposalId, onDeleted]);

  const fmtSize = (b) => b < 1048576 ? `${(b/1024).toFixed(0)} KB` : `${(b/1048576).toFixed(1)} MB`;

  return (
    <div className={`rounded-lg border p-3 transition-colors ${
      localDoc.uploaded ? 'border-green-200 bg-green-50'
      : localDoc.required ? 'border-gray-200 bg-white'
      : 'border-dashed border-gray-200 bg-gray-50'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${localDoc.uploaded ? 'bg-green-100' : 'bg-gray-100'}`}>
          {localDoc.uploaded ? <CheckCircle className="h-4 w-4 text-green-600" /> : <FileText className="h-4 w-4 text-gray-400" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{localDoc.name}</p>
          {localDoc.uploaded && localDoc.fileName
            ? <p className="text-xs text-green-600 truncate">{localDoc.fileName}{localDoc.fileSize ? ` · ${fmtSize(localDoc.fileSize)}` : ''}</p>
            : <p className={`text-xs ${localDoc.required ? 'text-red-500' : 'text-gray-400'}`}>
                {localDoc.required ? 'Mandatory' : 'Optional'} · PDF, JPG, PNG · max 5 MB
              </p>
          }
        </div>
        {!disabled && (
          <div className="flex items-center gap-1.5 shrink-0">
            {localDoc.uploaded ? (
              <Button type="button" variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}
                className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50" title="Remove">
                {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              </Button>
            ) : (
              <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}
                disabled={uploading} className="gap-1.5 text-xs h-8">
                {uploading ? <><Loader2 className="h-3 w-3 animate-spin" />{progress}%</> : <><Upload className="h-3 w-3" />Upload</>}
              </Button>
            )}
            <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
          </div>
        )}
      </div>
      {uploading && progress > 0 && (
        <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full livishield-bg-accent transition-all duration-200 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      )}
      {error && <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-3 w-3 shrink-0" />{error}</p>}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Timeline data
───────────────────────────────────────────── */
const TIMELINE = [
  { id: 'submitted',          icon: CheckCircle, title: 'Proposal Submitted',    timeframe: 'Completed',                  desc: 'Your application has been received and logged in our system.', done: true },
  { id: 'under_review',       icon: UserCheck,   title: 'Initial Review',         timeframe: '1–2 business days',          desc: 'Our underwriting team reviews your application details and verifies the information provided.' },
  { id: 'documents_required', icon: FileText,    title: 'Document Verification',  timeframe: '2–3 business days',          desc: 'Submitted documents are verified for authenticity and completeness.' },
  { id: 'medical_checkup',    icon: Stethoscope, title: 'Medical Assessment',     timeframe: 'If applicable',              desc: 'A medical checkup may be scheduled based on your age, sum insured, or declared conditions.', conditional: true },
  { id: 'approved',           icon: ShieldCheck, title: 'Underwriting Decision',  timeframe: '3–5 business days',          desc: 'Final approval by the underwriting team. You will be notified via email and SMS.' },
  { id: 'policy_issued',      icon: BadgeCheck,  title: 'Policy Issuance',        timeframe: '1 business day after approval', desc: 'Your policy document is generated and sent to your registered email address.' },
];

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
const ProposalSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state;

  const [copied, setCopied]               = useState(false);
  const [timeLeft, setTimeLeft]           = useState(48 * 60 * 60);
  const [expired, setExpired]             = useState(false);
  const [reactivating, setReactivating]   = useState(false);
  const [reactivated, setReactivated]     = useState(false);
  const [reactivateError, setReactivateError] = useState(null);
  const [docs, setDocs]                   = useState([]);
  const [proposalStatus, setProposalStatus] = useState('submitted');
  const [submitting, setSubmitting]         = useState(false);
  const [submitError, setSubmitError]       = useState(null);
  const [locked, setLocked]                 = useState(false); // true after submitDocuments

  useEffect(() => {
    if (!data) { navigate('/health-insurance/plans'); return; }
    setDocs(data.requiredDocuments || []);
    // If proposal already under_review (e.g. page refresh after submit), lock immediately
    if (data.proposalStatus === 'under_review') {
      setLocked(true);
      setProposalStatus('under_review');
    }

    // Compute remaining seconds from submittedAt (if provided), else default 48h
    const DOC_WINDOW_MS = 48 * 60 * 60 * 1000;
    let remaining = DOC_WINDOW_MS / 1000; // default 48h in seconds
    if (data.submittedAt) {
      const elapsed = Date.now() - new Date(data.submittedAt).getTime();
      const remainingMs = DOC_WINDOW_MS - elapsed;
      if (remainingMs <= 0) {
        setExpired(true);
        setTimeLeft(0);
        return; // no timer needed
      }
      remaining = Math.floor(remainingMs / 1000);
    }
    setTimeLeft(remaining);

    const t = setInterval(() => {
      setTimeLeft(p => {
        if (p <= 1) { clearInterval(t); setExpired(true); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [data, navigate]);

  const handleUploaded = useCallback((result) => {
    setDocs(prev => prev.map(d => d.type === result.data?.docType ? { ...d, uploaded: true, fileName: result.data?.fileName, fileSize: result.data?.fileSize } : d));
  }, []);

  const handleDeleted = useCallback((docType) => {
    setDocs(prev => prev.map(d => d.type === docType ? { ...d, uploaded: false, fileName: undefined, fileSize: undefined } : d));
  }, []);

  const handleSubmitDocuments = useCallback(async () => {
    if (!data?.proposalId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await proposalService.submitDocuments(data.proposalId);
      setLocked(true);
      setProposalStatus('under_review');
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit documents. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [data]);

  const handleReactivate = useCallback(async () => {
    if (!data?.proposalId) return;
    setReactivating(true); setReactivateError(null);
    try {
      const token = localStorage.getItem('liveshield_token');
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5001/api'}/proposals/${data.proposalId}/reactivate`,
        { method: 'POST', headers }
      );
      const result = await res.json();
      if (result.success) {
        setReactivated(true); setExpired(false); setTimeLeft(48 * 60 * 60);
      } else {
        setReactivateError(result.message || 'Reactivation failed.');
      }
    } catch { setReactivateError('Network error. Please try again.'); }
    finally { setReactivating(false); }
  }, [data]);

  if (!data) return null;

  const fmt = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const mandatoryDocs = docs.filter(d => d.required);
  const optionalDocs  = docs.filter(d => !d.required);
  const uploadedCount = docs.filter(d => d.uploaded).length;
  const allMandatoryDone = mandatoryDocs.length > 0 && mandatoryDocs.every(d => d.uploaded);
  const uploadDisabled = (expired && !reactivated) || locked;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* ── Hero ── */}
      <section className="livishield-gradient-bg text-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle className="h-9 w-9 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Proposal Submitted Successfully</h1>
          <p className="text-white/80 text-sm mb-6 max-w-xl mx-auto">
            We've received your application for <span className="font-semibold text-white">{data.planName}</span>.
            Our team will reach out within 1–2 business days.
          </p>
          <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-5 py-3 backdrop-blur-sm">
            <div className="text-left">
              <p className="text-xs text-white/60 uppercase tracking-wide">Proposal Number</p>
              <p className="text-xl font-bold tracking-widest">{data.proposalNumber}</p>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(data.proposalNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="ml-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors" title="Copy">
              {copied ? <CheckCircle className="h-4 w-4 text-green-300" /> : <Copy className="h-4 w-4 text-white/70" />}
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-5 text-sm">
            <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
              <Calendar className="h-3.5 w-3.5 text-white/70" />
              <span>Submitted {new Date().toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 text-white/70" />
              <span>Status: <span className="font-semibold capitalize">{proposalStatus.replace(/_/g,' ')}</span></span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Status banners ── */}
        {reactivated && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="p-2 bg-green-100 rounded-lg shrink-0"><CheckCircle className="h-5 w-5 text-green-600" /></div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800">Proposal Reactivated</p>
              <p className="text-xs text-green-700 mt-0.5">Your proposal is active again. You have a fresh 48-hour window to upload your documents.</p>
            </div>
            <div className="text-center shrink-0">
              <p className="text-xs text-green-600 mb-0.5">Time remaining</p>
              <p className="text-xl font-bold text-green-700 font-mono">{fmt(timeLeft)}</p>
            </div>
          </div>
        )}

        {!reactivated && expired && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg shrink-0"><XCircle className="h-5 w-5 text-red-600" /></div>
              <div>
                <p className="text-sm font-semibold text-red-800">Document Upload Window Expired</p>
                <p className="text-xs text-red-700 mt-1 leading-relaxed">
                  The 48-hour window has passed. Your proposal is on hold. You can reactivate within <span className="font-semibold">7 days</span> to get a fresh window — no need to refill the form.
                </p>
              </div>
            </div>
            <div className="bg-white border border-red-100 rounded-lg p-3 mb-4 text-xs text-gray-600 space-y-1">
              <p className="font-semibold text-gray-700 mb-1">What happens if you don't reactivate?</p>
              <p>• After 7 days the proposal is permanently cancelled and cannot be recovered.</p>
              <p>• You will need to submit a new proposal from scratch.</p>
            </div>
            {reactivateError && (
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-100 rounded-lg px-3 py-2 mb-3">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />{reactivateError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={handleReactivate} disabled={reactivating} className="livishield-btn-primary gap-2 flex-1">
                {reactivating ? <><Loader2 className="h-4 w-4 animate-spin" />Reactivating...</> : <><RefreshCw className="h-4 w-4" />Reactivate Proposal</>}
              </Button>
              <Button variant="outline" onClick={() => navigate('/health-insurance/plans')} className="flex-1 gap-2">
                <ArrowRight className="h-4 w-4" />Start Fresh
              </Button>
            </div>
          </div>
        )}

        {!expired && !reactivated && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-2 bg-amber-100 rounded-lg shrink-0"><AlertCircle className="h-5 w-5 text-amber-600" /></div>
              <div>
                <p className="text-sm font-semibold text-amber-800">Action Required — Upload Documents</p>
                <p className="text-xs text-amber-700 mt-0.5">Upload your KYC and supporting documents within 48 hours to avoid processing delays.</p>
              </div>
            </div>
            <div className="text-center shrink-0">
              <p className="text-xs text-amber-600 mb-0.5">Time remaining</p>
              <p className="text-xl font-bold text-amber-700 font-mono">{fmt(timeLeft)}</p>
            </div>
          </div>
        )}

        {/* ── Locked: under review banner ── */}
        {locked && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg shrink-0">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Documents Submitted — Proposal Under Review</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Your documents have been sent to our underwriting team. Verification takes 2–3 business days.
                You will be notified by email once the review is complete.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── LEFT ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Document upload card */}
            <Card className="livishield-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-1 pb-2 border-b">
                  <FileText className="h-4 w-4 livishield-text-accent" />
                  <h2 className="text-sm font-semibold livishield-text-primary">Required Documents</h2>
                  <div className="ml-auto flex items-center gap-2">
                    {locked ? (
                      <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200 gap-1">
                        <ShieldCheck className="h-3 w-3" />Submitted for Review
                      </Badge>
                    ) : uploadDisabled ? (
                      <Badge className="text-xs bg-red-100 text-red-600 border-red-200">Window closed</Badge>
                    ) : (
                      <span className="text-xs text-gray-500">{uploadedCount}/{docs.length} uploaded</span>
                    )}
                  </div>
                </div>

                {/* Upload progress bar — hidden once locked */}
                {!locked && docs.length > 0 && (
                  <div className="mb-4 mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Upload progress</span>
                      <span>{Math.round((uploadedCount / docs.length) * 100)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full livishield-bg-accent rounded-full transition-all duration-500"
                        style={{ width: `${(uploadedCount / docs.length) * 100}%` }} />
                    </div>
                  </div>
                )}

                {/* Locked state — read-only summary */}
                {locked ? (
                  <div className="mt-3 space-y-2">
                    {docs.map(doc => (
                      <div key={doc.type} className={`flex items-center gap-3 p-3 rounded-lg border ${doc.uploaded ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${doc.uploaded ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {doc.uploaded
                            ? <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                            : <FileText className="h-3.5 w-3.5 text-gray-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                          {doc.uploaded && doc.fileName
                            ? <p className="text-xs text-green-600 truncate">{doc.fileName}</p>
                            : <p className="text-xs text-gray-400">{doc.required ? 'Not uploaded' : 'Optional — skipped'}</p>}
                        </div>
                        <Badge className={`text-xs shrink-0 ${doc.uploaded ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                          {doc.uploaded ? 'Uploaded' : 'Skipped'}
                        </Badge>
                      </div>
                    ))}
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                      <p className="font-semibold mb-1">Documents are locked for review</p>
                      <p>Your documents have been submitted and cannot be changed. Our team will verify them within 2–3 business days.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {mandatoryDocs.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mandatory</p>
                        {mandatoryDocs.map(doc => (
                          <DocUploadCard key={doc.type} doc={doc} proposalId={data.proposalId}
                            disabled={uploadDisabled} onUploaded={handleUploaded} onDeleted={handleDeleted} />
                        ))}
                      </div>
                    )}

                    {optionalDocs.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Optional</p>
                        {optionalDocs.map(doc => (
                          <DocUploadCard key={doc.type} doc={doc} proposalId={data.proposalId}
                            disabled={uploadDisabled} onUploaded={handleUploaded} onDeleted={handleDeleted} />
                        ))}
                      </div>
                    )}

                    {/* Submit all documents button */}
                    {!uploadDisabled && (
                      <div className="mt-4 pt-4 border-t">
                        {submitError && (
                          <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
                            <AlertCircle className="h-3.5 w-3.5 shrink-0" />{submitError}
                          </div>
                        )}
                        {allMandatoryDone ? (
                          <Button
                            onClick={handleSubmitDocuments}
                            disabled={submitting}
                            className="w-full livishield-btn-primary gap-2 py-2.5"
                          >
                            {submitting
                              ? <><Loader2 className="h-4 w-4 animate-spin" />Submitting for Review...</>
                              : <><ShieldCheck className="h-4 w-4" />Submit All Documents for Review</>}
                          </Button>
                        ) : (
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-2">
                              Upload all <span className="font-semibold text-gray-700">{mandatoryDocs.filter(d => !d.uploaded).length}</span> remaining mandatory document{mandatoryDocs.filter(d => !d.uploaded).length !== 1 ? 's' : ''} to continue
                            </p>
                            <Button disabled className="w-full gap-2 opacity-50 cursor-not-allowed" variant="outline">
                              <ShieldCheck className="h-4 w-4" />Submit All Documents for Review
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-xs font-semibold text-blue-700 mb-1.5">Document Guidelines</p>
                      <ul className="text-xs text-blue-600 space-y-1">
                        <li>• Clear, readable scans or photos — no blurry images</li>
                        <li>• Accepted formats: PDF, JPG, PNG (max 5 MB per file)</li>
                        <li>• All four corners must be visible and not cropped</li>
                        <li>• Documents must be valid and not expired</li>
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="livishield-card">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold livishield-text-primary mb-4 pb-2 border-b">What Happens Next?</h2>
                <div className="relative">
                  <div className="absolute left-4 top-4 bottom-4 w-px bg-gray-200" />
                  <div className="space-y-5">
                    {TIMELINE.map((s, idx) => {
                      const Icon = s.icon;
                      const isActive = s.id === proposalStatus;
                      const isDone = idx === 0 || (proposalStatus === 'under_review' && idx <= 1);
                      return (
                        <div key={s.id} className="flex gap-4 relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border-2 transition-all ${
                            isDone    ? 'livishield-bg-accent border-transparent text-white' :
                            isActive  ? 'border-blue-400 bg-blue-50 text-blue-600' :
                                        'bg-white border-gray-200 text-gray-400'
                          }`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="flex-1 pb-1">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className={`text-sm font-semibold ${isDone ? 'livishield-text-accent' : isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                                {s.title}{s.conditional && <span className="ml-2 text-xs font-normal text-gray-400">(if applicable)</span>}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                isDone   ? 'bg-green-100 text-green-700' :
                                isActive ? 'bg-blue-100 text-blue-700' :
                                           'bg-gray-100 text-gray-500'
                              }`}>
                                {isDone ? 'Completed' : s.timeframe}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT ── */}
          <div className="w-full lg:w-64 shrink-0 space-y-4">
            <Card className="livishield-card">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quick Actions</p>
                <div className="space-y-2">
                  <Button className="w-full livishield-btn-primary gap-2 text-sm" onClick={() => navigate('/dashboard')}>
                    <LayoutDashboard className="h-4 w-4" />Track Application
                  </Button>
                  <Button variant="outline" className="w-full gap-2 text-sm"
                    onClick={() => window.open(`mailto:support@livishield.com?subject=Proposal ${data.proposalNumber}`)}>
                    <Mail className="h-4 w-4" />Email Support
                  </Button>
                  <Button variant="ghost" className="w-full gap-2 text-sm text-gray-600"
                    onClick={() => navigate('/health-insurance/plans')}>
                    <ArrowRight className="h-4 w-4" />Browse Plans
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="livishield-card">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Need Help?</p>
                <div className="space-y-3">
                  <a href="tel:18001234567" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 livishield-bg-light rounded-lg flex items-center justify-center shrink-0">
                      <Phone className="h-3.5 w-3.5 livishield-text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">1800-123-4567</p>
                      <p className="text-xs text-gray-400">Toll free</p>
                    </div>
                  </a>
                  <a href="mailto:support@livishield.com" className="flex items-center gap-3">
                    <div className="w-8 h-8 livishield-bg-light rounded-lg flex items-center justify-center shrink-0">
                      <Mail className="h-3.5 w-3.5 livishield-text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">support@livishield.com</p>
                      <p className="text-xs text-gray-400">24–48h response</p>
                    </div>
                  </a>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 livishield-bg-light rounded-lg flex items-center justify-center shrink-0">
                      <Calendar className="h-3.5 w-3.5 livishield-text-accent" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700">Mon – Sat</p>
                      <p className="text-xs text-gray-400">9:00 AM – 7:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-amber-800 mb-2">Important Reminders</p>
                <ul className="text-xs text-amber-700 space-y-1.5">
                  <li className="flex gap-1.5"><span className="shrink-0">•</span>Save your proposal number for all correspondence</li>
                  <li className="flex gap-1.5"><span className="shrink-0">•</span>Upload documents within 48 hours to avoid delays</li>
                  <li className="flex gap-1.5"><span className="shrink-0">•</span>Misrepresentation of information may lead to rejection</li>
                  <li className="flex gap-1.5"><span className="shrink-0">•</span>Medical checkup may be required for sum insured above ₹5 lakh or age above 45</li>
                  <li className="flex gap-1.5"><span className="shrink-0">•</span>Coverage begins only after approval and first premium payment</li>
                </ul>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProposalSuccess;
