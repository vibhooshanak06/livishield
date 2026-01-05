import Navbar from "../components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  Shield, 
  Users, 
  Award, 
  Target,
  Heart,
  Globe,
  TrendingUp,
  CheckCircle
} from "lucide-react";
import "../styles/theme.css";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Trust & Security",
      description: "We prioritize the security and privacy of our customers' information with industry-leading protection."
    },
    {
      icon: Heart,
      title: "Customer First",
      description: "Every decision we make is centered around providing the best possible experience for our customers."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We strive for excellence in everything we do, from our products to our customer service."
    },
    {
      icon: Globe,
      title: "Innovation",
      description: "We continuously innovate to provide cutting-edge insurance solutions for the modern world."
    }
  ];

  const milestones = [
    { year: "1970", event: "LiviShield founded with a mission to protect families" },
    { year: "1985", event: "Expanded to nationwide coverage across all 50 states" },
    { year: "2000", event: "Launched digital platform for online policy management" },
    { year: "2010", event: "Reached 1 million satisfied customers milestone" },
    { year: "2020", event: "Introduced AI-powered claims processing" },
    { year: "2024", event: "Serving over 2 million customers with 99.9% satisfaction rate" }
  ];

  const leadership = [
    {
      name: "Sarah Johnson",
      role: "Chief Executive Officer",
      experience: "20+ years in insurance industry",
      description: "Leading LiviShield's vision for innovative insurance solutions."
    },
    {
      name: "Michael Chen",
      role: "Chief Technology Officer",
      experience: "15+ years in fintech",
      description: "Driving digital transformation and technology innovation."
    },
    {
      name: "Emily Rodriguez",
      role: "Chief Claims Officer",
      experience: "18+ years in claims management",
      description: "Ensuring fast and fair claims processing for all customers."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="livishield-gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 livishield-badge-secondary">
              About LiviShield
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Protecting Lives for Over 
              <span className="livishield-text-light"> 50 Years</span>
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Since 1970, LiviShield has been committed to providing comprehensive insurance 
              solutions that protect what matters most to our customers. We combine decades 
              of experience with innovative technology to deliver exceptional service.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold livishield-text-primary mb-6">
                Our Mission
              </h2>
              <p className="text-lg livishield-text-secondary mb-6 leading-relaxed">
                To provide comprehensive, affordable, and accessible insurance solutions 
                that protect our customers' most valuable assets and give them peace of 
                mind for the future.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="livishield-text-primary">Customer-centric approach in everything we do</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="livishield-text-primary">Transparent and fair pricing policies</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="livishield-text-primary">Innovative technology for better service</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="livishield-section-light rounded-2xl p-8">
                <div className="text-center">
                  <div className="livishield-bg-accent w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold livishield-text-primary mb-4">Our Vision</h3>
                  <p className="livishield-text-secondary">
                    To be the most trusted and innovative insurance provider, 
                    setting the standard for customer service and protection 
                    in the digital age.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 livishield-section-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              Our Core Values
            </h2>
            <p className="text-xl livishield-text-secondary max-w-3xl mx-auto">
              These values guide every decision we make and every interaction we have with our customers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center livishield-hover-lift livishield-card">
                <CardHeader>
                  <div className="mx-auto livishield-bg-accent w-16 h-16 rounded-full flex items-center justify-center mb-4">
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl livishield-text-primary">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="livishield-text-secondary">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              Our Journey
            </h2>
            <p className="text-xl livishield-text-secondary max-w-3xl mx-auto">
              From humble beginnings to industry leadership - here's how we've grown over the decades.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full livishield-bg-accent"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <Card className="livishield-card border-0">
                      <CardContent className="p-6">
                        <Badge className="mb-2 livishield-badge-primary">
                          {milestone.year}
                        </Badge>
                        <p className="livishield-text-primary">{milestone.event}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="relative z-10 w-4 h-4 livishield-bg-accent rounded-full border-4 border-white shadow-lg"></div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="py-20 livishield-section-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              Leadership Team
            </h2>
            <p className="text-xl livishield-text-secondary max-w-3xl mx-auto">
              Meet the experienced professionals leading LiviShield into the future.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {leadership.map((leader, index) => (
              <Card key={index} className="text-center livishield-hover-lift livishield-card">
                <CardHeader>
                  <div className="mx-auto w-24 h-24 livishield-bg-accent rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold text-white">
                      {leader.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <CardTitle className="text-xl livishield-text-primary">{leader.name}</CardTitle>
                  <CardDescription className="livishield-text-accent font-semibold">
                    {leader.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge className="mb-3 livishield-badge-secondary">
                    {leader.experience}
                  </Badge>
                  <p className="livishield-text-secondary text-sm">
                    {leader.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 livishield-section-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              LiviShield by the Numbers
            </h2>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">2M+</div>
              <div className="text-white/80">Customers Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">50+</div>
              <div className="text-white/80">Years of Experience</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">99.9%</div>
              <div className="text-white/80">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold mb-2">24/7</div>
              <div className="text-white/80">Customer Support</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;