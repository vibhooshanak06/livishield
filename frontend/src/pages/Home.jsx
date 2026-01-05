import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  Shield, 
  Car, 
  Heart, 
  Users, 
  Award, 
  Clock, 
  Phone, 
  Mail,
  CheckCircle,
  ArrowRight,
  Star
} from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/theme.css";

const Home = () => {
  const features = [
    {
      icon: Shield,
      title: "Comprehensive Coverage",
      description: "Complete protection for all your insurance needs with industry-leading policies."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer service to assist you whenever you need help."
    },
    {
      icon: Award,
      title: "Award Winning",
      description: "Recognized as the leading insurance provider with multiple industry awards."
    },
    {
      icon: Users,
      title: "Trusted by Millions",
      description: "Over 2 million satisfied customers trust us with their insurance needs."
    }
  ];

  const insuranceTypes = [
    {
      icon: Car,
      title: "Car Insurance",
      description: "Comprehensive auto insurance coverage for your vehicle and peace of mind on the road.",
      features: ["Collision Coverage", "Liability Protection", "Comprehensive Coverage", "24/7 Roadside Assistance"],
      link: "/car-insurance"
    },
    {
      icon: Heart,
      title: "Health Insurance",
      description: "Complete health coverage for you and your family with extensive network of providers.",
      features: ["Medical Coverage", "Prescription Drugs", "Preventive Care", "Emergency Services"],
      link: "/health-insurance"
    }
  ];

  const stats = [
    { number: "2M+", label: "Happy Customers" },
    { number: "50+", label: "Years Experience" },
    { number: "99.9%", label: "Claim Success Rate" },
    { number: "24/7", label: "Customer Support" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="livishield-gradient-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 livishield-badge-secondary">
                Trusted Insurance Partner
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Protect What Matters Most with 
                <span className="livishield-text-light"> LiviShield</span>
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Comprehensive insurance solutions designed to safeguard your future. 
                From auto to health insurance, we've got you covered with industry-leading 
                protection and exceptional service.
              </p>
            </div>
            <div className="relative">
              <div className="livishield-card rounded-2xl p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="livishield-bg-accent p-4 rounded-full">
                    <Shield className="h-16 w-16 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2 livishield-text-primary">Your Protection Starts Here</h3>
                  <p className="livishield-text-secondary">Join millions who trust LiviShield</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              Trusted by Millions Worldwide
            </h2>
            <p className="text-xl livishield-text-secondary max-w-2xl mx-auto">
              Our commitment to excellence is reflected in these impressive numbers
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="livishield-card p-8 rounded-2xl livishield-hover-lift">
                  <div className="text-5xl lg:text-6xl font-bold livishield-text-accent mb-3 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="livishield-text-primary font-semibold text-lg mb-2">{stat.label}</div>
                  <div className="w-12 h-1 livishield-bg-accent mx-auto rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 livishield-section-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              Why Choose LiviShield?
            </h2>
            <p className="text-xl livishield-text-secondary max-w-3xl mx-auto">
              We combine decades of experience with innovative technology to deliver 
              insurance solutions that truly protect what matters most to you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center livishield-hover-lift livishield-card">
                <CardHeader>
                  <div className="mx-auto livishield-bg-accent w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl livishield-text-primary">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="livishield-text-secondary">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Insurance Types Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              Our Insurance Solutions
            </h2>
            <p className="text-xl livishield-text-secondary max-w-3xl mx-auto">
              Comprehensive coverage options tailored to meet your specific needs and budget.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {insuranceTypes.map((insurance, index) => (
              <Card key={index} className="livishield-hover-lift livishield-card">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="livishield-bg-accent p-3 rounded-lg">
                      <insurance.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl livishield-text-primary">{insurance.title}</CardTitle>
                      <CardDescription className="livishield-text-secondary mt-1">
                        {insurance.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {insurance.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="livishield-text-primary">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <Link to={insurance.link}>
                    <Button className="w-full livishield-btn-primary">
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 livishield-section-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              What Our Customers Say
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, index) => (
              <Card key={index} className="livishield-card">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="livishield-text-secondary mb-4">
                    "LiviShield has been our trusted insurance partner for over 5 years. 
                    Their customer service is exceptional and claims process is seamless."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 livishield-bg-accent rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">JD</span>
                    </div>
                    <div>
                      <p className="font-semibold livishield-text-primary">John Doe</p>
                      <p className="text-sm livishield-text-secondary">Satisfied Customer</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
              <p className="text-white/80">
                Your trusted partner for comprehensive insurance solutions.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/about" className="block text-white/80 hover:text-white transition-colors">About Us</Link>
                <Link to="/car-insurance" className="block text-white/80 hover:text-white transition-colors">Car Insurance</Link>
                <Link to="/health-insurance" className="block text-white/80 hover:text-white transition-colors">Health Insurance</Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <a href="#" className="block text-white/80 hover:text-white transition-colors">Help Center</a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">Claims</a>
                <a href="#" className="block text-white/80 hover:text-white transition-colors">Contact</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact Info</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-white/80">
                  <Phone className="h-4 w-4" />
                  <span>1-800-LIVI-SHIELD</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <Mail className="h-4 w-4" />
                  <span>support@livishield.com</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 mt-8 pt-8 text-center text-white/80">
            <p>&copy; 2024 LiviShield. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;