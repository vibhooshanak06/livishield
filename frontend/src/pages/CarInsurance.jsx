import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  Car, 
  Shield, 
  Wrench, 
  Phone, 
  Clock,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Users,
  Award
} from "lucide-react";
import "../styles/theme.css";

const CarInsurance = () => {
  const coverageTypes = [
    {
      icon: Shield,
      title: "Liability Coverage",
      description: "Protects you financially if you're responsible for an accident that injures others or damages their property.",
      features: ["Bodily Injury Liability", "Property Damage Liability", "Legal Defense Costs"]
    },
    {
      icon: Car,
      title: "Collision Coverage",
      description: "Pays for damage to your car from collisions with other vehicles or objects, regardless of fault.",
      features: ["Vehicle Repair Costs", "Replacement Value", "Deductible Options"]
    },
    {
      icon: Shield,
      title: "Comprehensive Coverage",
      description: "Covers damage to your car from non-collision events like theft, vandalism, or natural disasters.",
      features: ["Theft Protection", "Weather Damage", "Vandalism Coverage"]
    },
    {
      icon: Wrench,
      title: "Roadside Assistance",
      description: "24/7 emergency roadside services to help you when your vehicle breaks down or you're stranded.",
      features: ["Towing Service", "Jump Start", "Flat Tire Change", "Lockout Service"]
    }
  ];

  const benefits = [
    {
      icon: Clock,
      title: "24/7 Claims Support",
      description: "File and track claims anytime with our dedicated support team."
    },
    {
      icon: Phone,
      title: "Mobile App",
      description: "Manage your policy, file claims, and get roadside help from your phone."
    },
    {
      icon: DollarSign,
      title: "Competitive Rates",
      description: "Get the best coverage at affordable rates with multiple discount options."
    },
    {
      icon: Award,
      title: "Award-Winning Service",
      description: "Recognized for outstanding customer service and claims handling."
    }
  ];

  const discounts = [
    "Safe Driver Discount - Up to 25% off",
    "Multi-Policy Discount - Bundle and save",
    "Good Student Discount - For students with good grades",
    "Anti-Theft Device Discount - Security system savings",
    "Low Mileage Discount - Drive less, pay less",
    "Defensive Driving Course - Complete course for savings"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="livishield-gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 livishield-badge-secondary">
                Auto Insurance
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Comprehensive 
                <span className="livishield-text-light"> Car Insurance</span> 
                Coverage
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Protect your vehicle and your peace of mind with our comprehensive auto 
                insurance coverage. From liability to comprehensive protection, we've got 
                you covered on every journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="livishield-btn-secondary">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="livishield-card rounded-2xl p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="livishield-bg-accent p-4 rounded-full">
                    <Car className="h-16 w-16 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2 livishield-text-primary">Drive with Confidence</h3>
                  <p className="livishield-text-secondary">Complete protection for every mile</p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="livishield-section-light rounded-lg p-3">
                      <div className="font-bold text-lg livishield-text-primary">99.9%</div>
                      <div className="livishield-text-secondary">Claim Satisfaction</div>
                    </div>
                    <div className="livishield-section-light rounded-lg p-3">
                      <div className="font-bold text-lg livishield-text-primary">24/7</div>
                      <div className="livishield-text-secondary">Support Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Types */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Complete Coverage Options
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our comprehensive range of coverage options designed to protect 
              you, your vehicle, and your financial well-being.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {coverageTypes.map((coverage, index) => (
              <Card key={index} className="livishield-hover-lift livishield-card">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="livishield-bg-accent p-3 rounded-lg">
                      <coverage.icon className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl livishield-text-primary">{coverage.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="livishield-text-secondary mt-2">
                    {coverage.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {coverage.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="livishield-text-primary text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Car Insurance?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the LiviShield difference with benefits designed around your needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center livishield-hover-lift livishield-card">
                <CardHeader>
                  <div className="mx-auto livishield-bg-light w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <benefit.icon className="h-8 w-8 livishield-icon-accent" />
                  </div>
                  <CardTitle className="text-lg livishield-text-primary">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="livishield-text-secondary">
                    {benefit.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Discounts Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Save More with Our Discounts
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Take advantage of our various discount programs to reduce your premium 
                while maintaining comprehensive coverage.
              </p>
              <div className="space-y-4">
                {discounts.map((discount, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{discount}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Card className="livishield-card">
                <CardHeader className="livishield-section-primary text-white rounded-t-lg">
                  <CardTitle className="text-2xl text-center">Learn More About Our Coverage</CardTitle>
                  <CardDescription className="text-white/90 text-center">
                    Discover comprehensive protection options
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold livishield-text-accent mb-2">Save up to</div>
                      <div className="text-6xl font-bold livishield-text-primary mb-2">25%</div>
                      <div className="livishield-text-secondary">on your car insurance</div>
                    </div>
                    <div className="space-y-3">
                      <Button className="w-full livishield-btn-primary">
                        Explore Coverage Options
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-center text-sm livishield-text-secondary">
                      Professional insurance solutions • Trusted by millions
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Claims Process */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Simple Claims Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              When accidents happen, we're here to help. Our streamlined claims process 
              gets you back on the road quickly.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Report Claim", description: "Call us or use our mobile app to report your claim 24/7" },
              { step: "2", title: "Assessment", description: "Our expert adjusters assess the damage and determine coverage" },
              { step: "3", title: "Repair", description: "Choose from our network of certified repair shops or your preferred shop" },
              { step: "4", title: "Resolution", description: "Get back on the road with your vehicle fully repaired" }
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="livishield-bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold livishield-text-primary mb-2">{item.title}</h3>
                <p className="livishield-text-secondary">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 livishield-section-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Get Protected?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join millions of drivers who trust LiviShield for their auto insurance needs. 
            Get a personalized quote in just minutes.
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="livishield-btn-secondary">
              Explore Car Insurance Options
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CarInsurance;