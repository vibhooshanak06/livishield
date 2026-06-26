import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Shield, CreditCard, Lock, AlertCircle, Loader2,
  CheckCircle, ArrowLeft, Info
} from 'lucide-react';
import paymentService from '../services/paymentService';
import proposalService from '../services/proposalService';
import '../styles/theme.css';

const parseJSON = (v, fb = null) => {
  if (!v) return fb;
  if (typeof v === 'object') return v;
  try { return JSON.parse(v); } catch { return fb; }
};

const PaymentPage = () => {
  const { proposalId }  = useParams();
  const navigate        = useNavigate();
  const { user }        = useAuth();

  const [proposal,   setProposal]   = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [paying,     setPaying]     = useState(false);
  const [error,      setError]      = useState(null);
  const [sdkReady,   setSdkReady]   = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const data = await proposalService.getProposalById(proposalId);
        setProposal(data);
        const ok = await paymentService.loadRazorpaySDK();
        setSdkReady(ok);
        if (!ok) setError('Failed to load payment gateway. Check your internet connection.');
      } catch (e) {
        setError(e.message || 'Failed to load proposal');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [proposalId]);

  const handlePay = async () => {
    if (!sdkReady) { setError('Payment gateway not loaded. Refresh and try again.'); return; }
    setPaying(true);
    setError(null);
    try {
      const { data: orderData } = await paymentService.createOrder(proposalId);

      const options = {
        key:         orderData.keyId,
        amount:      orderData.amount,
        currency:    orderData.currency,
        name:        'LiviShield Health Insurance',
        description: orderData.description,
        order_id:    orderData.orderId,
        prefill: {
          name:    orderData.prefill.name,
          email:   orderData.prefill.email,
          contact: orderData.prefill.contact,
        },
        theme: { color: '#00b4d8' },
        modal: {
          ondismiss: () => setPaying(false),
        },
        handler: async (response) => {
          try {
            const { data: verifyData } = await paymentService.verifyPayment({
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            navigate('/payment-success', {
              state: {
                proposalId,
                proposalNumber: orderData.proposalNumber,
                planName:       orderData.planName,
                amountPaid:     orderData.amount / 100,
                paymentId:      response.razorpay_payment_id,
                policyDetails:  verifyData.policyDetails,
              },
              replace: true,
            });
          } catch (e) {
            setError('Payment captured but verification failed. Please contact support with Payment ID: ' + response.razorpay_payment_id);
            setPaying(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setError(`Payment failed: ${resp.error.description}`);
        setPaying(false);
      });
      rzp.open();
    } catch (e) {
      setError(e.message || 'Failed to initiate payment');
      setPaying(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin livishield-text-accent mx-auto mb-3" />
          <p className="text-sm livishield-text-secondary">Loading payment details...</p>
        </div>
      </div>
    </div>
  );

  if (error && !proposal) return (
    <div className="min-h-screen bg-gray-50"><Navbar />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
        <p className="text-gray-800 font-medium mb-4">{error}</p>
        <Button onClick={() => navigate('/dashboard')} className="livishield-btn-primary">Back to Dashboard</Button>
      </div>
    </div>
  );

  const pm      = parseJSON(proposal?.premium_details, {});
  const pi      = parseJSON(proposal?.personal_info, {});
  const policy  = parseJSON(proposal?.policy_details, null);
  const amount  = pm.totalAnnualPremium || 0;

  // Guard: only approved proposals can pay
  if (proposal && proposal.status !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50"><Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <AlertCircle className="h-12 w-12 text-orange-400 mx-auto mb-3" />
          <p className="text-gray-800 font-medium mb-2">Payment not available</p>
          <p className="text-sm text-gray-500 mb-6">
            Payment is only allowed after admin approval. Current status: <strong>{proposal.status?.replace(/_/g,' ')}</strong>
          </p>
          <Button onClick={() => navigate(`/proposals/${proposalId}`)} className="livishield-btn-primary">
            View Proposal
          </Button>
        </div>
      </div>
    );
  }

  // Guard: already paid
  if (proposal?.payment_status === 'paid' || proposal?.status === 'policy_issued') {
    return (
      <div className="min-h-screen bg-gray-50"><Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-800 font-semibold mb-2">Premium already paid</p>
          <p className="text-sm text-gray-500 mb-6">Your policy is active. No further payment needed.</p>
          <Button onClick={() => navigate(`/proposals/${proposalId}`)} className="livishield-btn-primary">
            View Policy
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="livishield-gradient-bg text-white py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/proposals/${proposalId}`)}
            className="text-white/80 hover:text-white hover:bg-white/10 gap-1.5 mb-4">
            <ArrowLeft className="h-4 w-4" />Back to Proposal
          </Button>
          <h1 className="text-2xl font-bold">Pay Premium</h1>
          <p className="text-white/80 text-sm mt-1">Complete your payment to activate your health insurance policy</p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-5 gap-5 items-start">

          {/* ── LEFT: payment form ── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Approval badge */}
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">Proposal Approved</p>
                <p className="text-xs text-green-700">
                  Your application has been reviewed and approved. Pay the premium to issue your policy.
                </p>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Payment card */}
            <Card className="livishield-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-5">
                  <CreditCard className="h-5 w-5 livishield-text-accent" />
                  <h2 className="text-base font-semibold livishield-text-primary">Secure Payment via Razorpay</h2>
                  <Lock className="h-4 w-4 text-gray-400 ml-auto" />
                </div>

                <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Plan</span>
                    <span className="font-medium text-gray-800">{proposal?.plan_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Proposal No.</span>
                    <span className="font-mono text-gray-800">{proposal?.proposal_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Policyholder</span>
                    <span className="font-medium text-gray-800">{pi.firstName} {pi.lastName}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="font-semibold text-gray-700">Annual Premium</span>
                    <span className="font-bold text-lg livishield-text-accent">
                      {paymentService.formatCurrency(amount)}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full livishield-btn-primary gap-2 py-3 text-base"
                  disabled={paying || !sdkReady}
                  onClick={handlePay}
                >
                  {paying
                    ? <><Loader2 className="h-5 w-5 animate-spin" />Processing...</>
                    : <><CreditCard className="h-5 w-5" />Pay {paymentService.formatCurrency(amount)}</>
                  }
                </Button>

                <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                  <Lock className="h-3 w-3" />
                  Secured by Razorpay · 256-bit SSL encryption
                </p>
              </CardContent>
            </Card>

            {/* Test mode info */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800 mb-1.5">Test Mode — No real money charged</p>
                    <div className="text-xs text-blue-700 space-y-1 font-mono">
                      <p>Card: <strong>4111 1111 1111 1111</strong></p>
                      <p>Expiry: any future date &nbsp; CVV: any 3 digits</p>
                      <p>OTP: <strong>123456</strong></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT: summary ── */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="livishield-card">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 livishield-text-accent" />
                  <h3 className="text-sm font-semibold livishield-text-primary">What You Get</h3>
                </div>
                <div className="space-y-3">
                  {[
                    'Policy issued immediately after payment',
                    'Policy document emailed to you',
                    'Cashless treatment at network hospitals',
                    'Coverage active from today',
                    '24/7 customer support',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">{item}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="livishield-card">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment Summary</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Base Premium</span>
                    <span>{paymentService.formatCurrency(pm.basePremium || 0)}</span>
                  </div>
                  {(pm.addOnPremium || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Add-ons</span>
                      <span>{paymentService.formatCurrency(pm.addOnPremium)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 font-semibold">
                    <span>Total Due</span>
                    <span className="livishield-text-accent">{paymentService.formatCurrency(amount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
