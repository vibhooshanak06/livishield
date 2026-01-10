import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  CheckCircle,
  FileText,
  Upload,
  Phone,
  Mail,
  Calendar,
  ArrowRight,
  Download,
  Clock,
  AlertCircle,
  User,
  CreditCard
} from 'lucide-react';
import '../styles/theme.css';

const ProposalSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds

  const proposalData = location.state;

  useEffect(() => {
    if (!proposalData) {
      navigate('/health-insurance/plans');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [proposalData, navigate]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!proposalData) {
    return null;
  }

  const nextSteps = [
    {
      step: 1,
      title: "Document Upload",
      description: "Upload required documents within 48 hours",
      status: "pending",
      timeframe: "Within 48 hours"
    },
    {
      step: 2,
      title: "Document Verification",
      description: "Our team will verify your documents",
      status: "upcoming",
      timeframe: "2-3 business days"
    },
    {
      step: 3,
      title: "Medical Checkup",
      description: "Medical checkup if required based on age/sum insured",
      status: "upcoming",
      timeframe: "If required"
    },
    {
      step: 4,
      title: "Proposal Review",
      description: "Underwriting team reviews your application",
      status: "upcoming",
      timeframe: "3-5 business days"
    },
    {
      step: 5,
      title: "Policy Issuance",
      description: "Policy document issued upon approval",
      status: "upcoming",
      timeframe: "1-2 business days"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Success Header */}
      <section className="livishield-gradient-bg text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Proposal Submitted Successfully!
            </h1>
            <p className="text-lg text-white/90 mb-6">
              Your health insurance proposal has been received and is being processed.
            </p>
          </div>
          
          <div className="livishield-card p-6 text-left max-w-md mx-auto">
            <div className="text-center mb-4">
              <div className="text-2xl font-bold livishield-text-accent mb-1">
                {proposalData.proposalNumber}
              </div>
              <div className="text-sm livishield-text-secondary">Proposal Number</div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="livishield-text-secondary">Plan:</span>
                <span className="font-medium">{proposalData.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="livishield-text-secondary">Status:</span>
                <Badge className="livishield-badge-secondary">Under Review</Badge>
              </div>
              <div className="flex justify-between">
                <span className="livishield-text-secondary">Submitted:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Important Notice */}
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <Clock className="h-6 w-6 text-orange-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-800 mb-2">Action Required Within 48 Hours</h3>
                <p className="text-orange-700 mb-3">
                  Please upload the required documents within 48 hours to avoid delays in processing your application.
                </p>
                <div className="text-2xl font-bold text-orange-600">
                  Time Remaining: {formatTime(timeLeft)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Required Documents */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 livishield-text-accent" />
                  <span>Required Documents</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {proposalData.requiredDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 livishield-section-light rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{doc.name}</div>
                          <div className="text-sm livishield-text-secondary">
                            {doc.required ? 'Required' : 'Optional'}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="flex items-center space-x-2">
                        <Upload className="h-4 w-4" />
                        <span>Upload</span>
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Document Guidelines:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Upload clear, readable copies of documents</li>
                        <li>Accepted formats: PDF, JPG, PNG (Max 5MB per file)</li>
                        <li>Ensure all details are visible and not cropped</li>
                        <li>Documents should be valid and not expired</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        step.status === 'pending' ? 'livishield-bg-accent text-white' :
                        step.status === 'completed' ? 'bg-green-500 text-white' :
                        'bg-gray-200 text-gray-600'
                      }`}>
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold livishield-text-primary">{step.title}</h4>
                          <span className="text-xs livishield-text-secondary">{step.timeframe}</span>
                        </div>
                        <p className="text-sm livishield-text-secondary">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 livishield-text-accent" />
                  <span>Need Help?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 livishield-text-accent" />
                  <div>
                    <div className="font-medium">Call Us</div>
                    <div className="text-sm livishield-text-secondary">1800-123-4567</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 livishield-text-accent" />
                  <div>
                    <div className="font-medium">Email Support</div>
                    <div className="text-sm livishield-text-secondary">support@livishield.com</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 livishield-text-accent" />
                  <div>
                    <div className="font-medium">Business Hours</div>
                    <div className="text-sm livishield-text-secondary">Mon-Sat: 9 AM - 7 PM</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full livishield-btn-primary"
                  onClick={() => navigate('/dashboard')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Track Application
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(`mailto:support@livishield.com?subject=Proposal ${proposalData.proposalNumber}`)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Email Support
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/health-insurance/plans')}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Browse More Plans
                </Button>
              </CardContent>
            </Card>

            {/* Important Reminders */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800">Important Reminders</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-yellow-700 space-y-2">
                <p>• Keep your proposal number safe for future reference</p>
                <p>• Upload documents within 48 hours</p>
                <p>• Ensure all information provided is accurate</p>
                <p>• Medical checkup may be required for certain cases</p>
                <p>• Policy will be issued only after approval</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalSuccess;