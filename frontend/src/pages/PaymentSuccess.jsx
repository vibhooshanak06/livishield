import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { CheckCircle, Shield, BadgeCheck, ArrowRight, LayoutDashboard, FileText, Download } from 'lucide-react';
import paymentService from '../services/paymentService';
import '../styles/theme.css';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data     = location.state;

  useEffect(() => {
    if (!data) navigate('/dashboard', { replace: true });
  }, [data, navigate]);

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="livishield-gradient-bg text-white py-14">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-20 h-20 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
            <CheckCircle className="h-11 w-11 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-white/80 text-sm mb-6">
            Your premium has been received. Your policy is now active.
          </p>
          <div className="inline-flex items-center gap-4 bg-white/10 border border-white/20 rounded-xl px-6 py-4 backdrop-blur-sm">
            <div className="text-left">
              <p className="text-xs text-white/60 uppercase tracking-wide">Amount Paid</p>
              <p className="text-2xl font-bold">{paymentService.formatCurrency(data.amountPaid)}</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-left">
              <p className="text-xs text-white/60 uppercase tracking-wide">Payment ID</p>
              <p className="font-mono text-sm font-semibold">{data.paymentId}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-5">

        {/* Policy Card */}
        <Card className="livishield-card border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-green-100 rounded-xl">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="font-semibold livishield-text-primary">Policy Active</h2>
                <p className="text-sm livishield-text-secondary">{data.planName}</p>
              </div>
              <div className="ml-auto">
                <span className="text-xs bg-green-100 text-green-700 border border-green-200 rounded-full px-3 py-1 font-medium">
                  ✓ Issued
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-0.5">Proposal Number</p>
                <p className="font-mono font-semibold text-gray-800">{data.proposalNumber}</p>
              </div>
              {data.policyDetails?.policyNumber && (
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Policy Number</p>
                  <p className="font-mono font-semibold text-green-700">{data.policyDetails.policyNumber}</p>
                </div>
              )}
              {data.policyDetails?.policyStartDate && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Policy Start</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(data.policyDetails.policyStartDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </p>
                </div>
              )}
              {data.policyDetails?.policyEndDate && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">Policy End</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(data.policyDetails.policyEndDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                  </p>
                </div>
              )}
            </div>

            {/* GST breakdown */}
            {data.breakdown && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment Receipt</p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Net Premium</span>
                    <span>{paymentService.formatCurrency(data.breakdown.basePremium)}</span>
                  </div>
                  <div className="flex justify-between text-amber-700">
                    <span className="flex items-center gap-1">
                      GST <span className="text-xs bg-amber-100 border border-amber-200 rounded px-1">{data.breakdown.gstRate}%</span>
                    </span>
                    <span>+{paymentService.formatCurrency(data.breakdown.gstAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1.5 font-bold">
                    <span className="livishield-text-primary">Total Paid</span>
                    <span className="livishield-text-accent">{paymentService.formatCurrency(data.breakdown.totalPayable)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* What happens next */}
        <Card className="livishield-card">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold livishield-text-primary mb-4">What Happens Next</h3>
            <div className="space-y-3">
              {[
                { icon: BadgeCheck, text: 'Policy document will be emailed to your registered email address', color: 'text-green-600', bg: 'bg-green-50' },
                { icon: Shield,     text: 'Your coverage is active from today — you can use your policy immediately', color: 'text-blue-600', bg: 'bg-blue-50' },
                { icon: FileText,   text: 'View your proposal and policy details anytime in My Dashboard', color: 'livishield-text-accent', bg: 'livishield-bg-light' },
              ].map(({ icon: Icon, text, color, bg }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center shrink-0`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1 livishield-btn-primary gap-2"
            onClick={() => navigate('/dashboard')}>
            <LayoutDashboard className="h-4 w-4" />Go to Dashboard
          </Button>
          <Button variant="outline" className="flex-1 gap-2"
            onClick={() => navigate(`/proposals/${data.proposalId}`)}>
            <FileText className="h-4 w-4" />View Proposal
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 pb-4">
          Payment ID: <span className="font-mono">{data.paymentId}</span> · 
          Powered by Razorpay
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
