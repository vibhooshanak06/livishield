import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  Shield,
  Heart,
  Users,
  Award,
  Clock,
  Phone,
  Mail,
  CheckCircle,
  ArrowRight,
  Star,
  FileText,
  Stethoscope,
  BadgeCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/theme.css";

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: "Comprehensive Coverage",
      description: "Complete health protection with industry-leading policies covering hospitalisation, OPD, and more."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer service to assist you whenever you need help."
    },
    {
      icon: Award,
      title: "Award Winning",
      description: "Recognized as a leading health insurance provider with multiple industry awards."
    },
    {
      icon: Users,
      title: "Trusted by Millions",
      description: "Over 2 million satisfied customers trust us with their health insurance needs."
    }
  ];

  const healthBenefits = [
    {
      icon: Stethoscope,
      title: "Individual Plans",
      description: "Tailored health coverage for individuals with flexible sum insured options.",
      features: ["Cashless Hospitalisation", "Pre & Post Hospitalisation", "Day Care Procedures", "Ambulance Cover"],
    },
    {
      icon: Heart,
      title: "Family Floater Plans",
      description: "One policy to cover the entire family with a shared sum insured pool.",
      features: ["Cover Entire Family", "Maternity Benefits", "New-born Cover", "No Room Rent Capping"],
    },
    {
      icon: BadgeCheck,
      title: "Critical Illness Plans",
      description: "Lump sum benefit on diagnosis of 30+ critical illnesses including cancer and heart disease.",
      features: ["Lump Sum Payout", "30+ Critical Illnesses", "Income Replacement", "Tax Benefit u/s 80D"],
    },
    {
      icon: FileText,
      title: "Senior Citizen Plans",
      description: "Specialised plans for senior citizens aged 60–80 with comprehensive coverage.",
      features: ["Higher Entry Age", "Pre-existing Cover", "Domiciliary Treatment", "Annual Health Check-up"],
    }
  ];

  const stats = [
    { number: "2M+", label: "Happy Customers" },
    { number: "50K+", label: "Network Hospitals" },
    { number: "98.5%", label: "Claim Settlement Rate" },
    { number: "24/7", label: "Customer Support" }
  ];

  const testimonials = [
    { name: "Priya Sharma", role: "Individual Plan", quote: "LiviShield's cashless facility at Apollo Hospital saved me from financial stress during my surgery. The claim was settled in 24 hours!", initials: "PS" },
    { name: "Rajesh & Family", role: "Family Floater Plan", quote: "Our entire family of 4 is covered under one policy. The maternity benefit and new-born cover made it a complete package for us.", initials: "RF" },
    { name: "Dr. Mehta", role: "Critical Illness Plan", quote: "After my cardiac diagnosis, LiviShield paid the lump sum directly. No bills, no hassle — just immediate financial support when I needed it most.", initials: "DM" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="livishield-gradient-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 livishield-badge-secondary">India's Trusted Health Insurance</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Protect Your Health,
                <span className="livishield-text-light"> Protect Your Future</span>
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Comprehensive health insurance plans designed for individuals, families, and senior citizens.
                Cashless treatment at 50,000+ hospitals across India.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/health-insurance/plans">
                  <Button size="lg" className="livishield-btn-secondary w-full sm:w-auto">
                    Explore Plans <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/health-insurance">
                  <Button size="lg" variant="ghost" className="text-white border border-white/40 hover:bg-white/10 w-full sm:w-auto">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div>
              <div className="livishield-card rounded-2xl p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="livishield-bg-accent p-4 rounded-full">
                    <Heart className="h-16 w-16 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2 livishield-text-primary">Your Health, Our Priority</h3>
                  <p className="livishield-text-secondary mb-6">Get covered in minutes. File claims in 24 hrs.</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="livishield-section-light rounded-lg p-3">
                      <div className="font-bold text-lg livishield-text-primary">50K+</div>
                      <div className="livishield-text-secondary">Network Hospitals</div>
                    </div>
                    <div className="livishield-section-light rounded-lg p-3">
                      <div className="font-bold text-lg livishield-text-primary">98.5%</div>
                      <div className="livishield-text-secondary">Claim Settlement</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">Trusted by Millions Across India</h2>
            <p className="text-xl livishield-text-secondary max-w-2xl mx-auto">Our numbers speak for themselves</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="livishield-card p-8 rounded-2xl livishield-hover-lift">
                  <div className="text-5xl lg:text-6xl font-bold livishield-text-accent mb-3 group-hover:scale-110 transition-transform duration-300">{stat.number}</div>
                  <div className="livishield-text-primary font-semibold text-lg mb-2">{stat.label}</div>
                  <div className="w-12 h-1 livishield-bg-accent mx-auto rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why LiviShield */}
      <section className="py-20 livishield-section-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">Why Choose LiviShield?</h2>
            <p className="text-xl livishield-text-secondary max-w-3xl mx-auto">
              We combine decades of experience with technology to deliver health insurance that truly protects.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <Card key={i} className="text-center livishield-hover-lift livishield-card">
                <CardHeader>
                  <div className="mx-auto livishield-bg-accent w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <f.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl livishield-text-primary">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="livishield-text-secondary">{f.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Health Plans */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">Our Health Insurance Plans</h2>
            <p className="text-xl livishield-text-secondary max-w-3xl mx-auto">
              Tailored coverage for every life stage and need.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {healthBenefits.map((plan, i) => (
              <Card key={i} className="livishield-hover-lift livishield-card">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="livishield-bg-accent p-3 rounded-lg shrink-0">
                      <plan.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl livishield-text-primary">{plan.title}</CardTitle>
                      <CardDescription className="livishield-text-secondary mt-1">{plan.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-6">
                    {plan.features.map((feat, j) => (
                      <div key={j} className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm livishield-text-primary">{feat}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/health-insurance/plans">
                    <Button className="w-full livishield-btn-primary">
                      View Plans <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 livishield-section-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">What Our Customers Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="livishield-card">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} className="h-5 w-5 text-yellow-400 fill-current" />)}
                  </div>
                  <p className="livishield-text-secondary mb-5 text-sm leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 livishield-bg-accent rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white font-semibold text-sm">{t.initials}</span>
                    </div>
                    <div>
                      <p className="font-semibold livishield-text-primary text-sm">{t.name}</p>
                      <p className="text-xs livishield-text-secondary">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 livishield-section-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Get Health Protected?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Browse plans, get an instant quote, and apply online in minutes.
          </p>
          <Link to="/health-insurance/plans">
            <Button size="lg" className="livishield-btn-secondary">
              Compare Health Plans <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="livishield-gradient-header text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-8 w-8 text-white" />
                <span className="text-xl font-bold">LiviShield</span>
              </div>
              <p className="text-white/80 text-sm">Your trusted partner for comprehensive health insurance solutions.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2 text-sm">
                <Link to="/about" className="block text-white/80 hover:text-white transition-colors">About Us</Link>
                <Link to="/health-insurance" className="block text-white/80 hover:text-white transition-colors">Health Insurance</Link>
                <Link to="/health-insurance/plans" className="block text-white/80 hover:text-white transition-colors">Browse Plans</Link>
                <Link to="/dashboard" className="block text-white/80 hover:text-white transition-colors">My Dashboard</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-white/80 hover:text-white transition-colors">Help Center</a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">Claim Process</a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">Network Hospitals</a>
                <a href="mailto:support@livishield.com" className="block text-white/80 hover:text-white transition-colors">Contact Us</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2 text-white/80">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>1800-123-4567 (Toll Free)</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>support@livishield.com</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/80 text-sm">
            <p>&copy; {new Date().getFullYear()} LiviShield Health Insurance. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
