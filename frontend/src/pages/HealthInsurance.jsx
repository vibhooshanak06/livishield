import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  Heart, 
  Shield, 
  Stethoscope, 
  Phone, 
  Clock,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Users,
  Award,
  Activity,
  Pill,
  Eye,
  Smile
} from "lucide-react";
import "../styles/theme.css";

const HealthInsurance = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="livishield-gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 livishield-badge-secondary">
                Health Insurance
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Complete 
                <span className="livishield-text-light"> Health Insurance</span> 
                Protection
              </h1>
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Comprehensive health coverage for you and your family. From routine checkups 
                to major medical procedures, we provide the protection you need to stay healthy 
                and financially secure.
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
                    <Heart className="h-16 w-16 text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2 livishield-text-primary">Your Health, Our Priority</h3>
                  <p className="livishield-text-secondary">Comprehensive care for every stage of life</p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="livishield-section-light rounded-lg p-3">
                      <div className="font-bold text-lg livishield-text-primary">50K+</div>
                      <div className="livishield-text-secondary">Healthcare Providers</div>
                    </div>
                    <div className="livishield-section-light rounded-lg p-3">
                      <div className="font-bold text-lg livishield-text-primary">24/7</div>
                      <div className="livishield-text-secondary">Telehealth Access</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Health Insurance Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              What is Health Insurance?
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src="/src/assets/health-insurance.jpg" 
                  alt="Health Insurance Coverage" 
                  className="w-full h-80 object-cover"
                />
                <div className="absolute inset-0 livishield-gradient-bg opacity-20"></div>
              </div>
            </div>
            <div>
              <p className="text-lg livishield-text-secondary mb-6 leading-relaxed">
                In simple terms, when you buy health insurance, you get a financial cover up to a certain amount for the medical expenses you may incur in a year. It covers emergency and planned expenses for hospitalisation, day-care treatments, surgeries, pre and post-hospitalisation, ambulance charges.
              </p>
              <p className="text-lg livishield-text-secondary mb-6 leading-relaxed">
                Hence, a right health insurance policy helps you ward off unnecessary financial burden when a medical situation or emergency arises. Moreover, it also offers tax savings under Section 80D of the Income Tax, 1961 on the premium amount you pay to the insurer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Health Insurance Works */}
      <section className="py-20 livishield-section-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              How Health Insurance Works in India?
            </h2>
            <p className="text-xl livishield-text-secondary max-w-3xl mx-auto">
              Here is how health insurance works in India:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Coverage in Return of Premiums",
                description: "A health insurance policy covers your planned and emergency medical expenses in exchange for a regular premium."
              },
              {
                title: "Up to Sum Insured Limit",
                description: "Your insurance company will cover your healthcare expenses for up to the sum insured limit of the mediclaim policy."
              },
              {
                title: "Coverage Vary with Plan",
                description: "Medical coverage varies from one health insurance plan to another. For instance, Plan A covers hospitalization and OPD expenses, while Plan B covers only hospitalization expenses."
              },
              {
                title: "Upgrade Coverage with Add-ons",
                description: "You can upgrade the coverage of your mediclaim policy by buying add-on covers, such as critical illness cover, consumables cover, hospital daily cash, etc., on the payment of additional premiums."
              },
              {
                title: "Waiting Period Applies",
                description: "An initial waiting period applies to all medical insurance plans, except for accidental injuries. However, pre-existing diseases are covered after a waiting period of up to 3 years."
              },
              {
                title: "Premium is Not the Same for Everyone",
                description: "Health insurance premiums vary from person to person due to several factors, such as age, medical history, city, sum insured, etc."
              }
            ].map((item, index) => (
              <Card key={index} className="livishield-hover-lift livishield-card">
                <CardHeader>
                  <CardTitle className="text-lg livishield-text-primary">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="livishield-text-secondary">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits - Circular Design */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              Key Benefits to Buy a Health Insurance Plan
            </h2>
          </div>
          
          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            {/* Left Side - Text Content */}
            <div>
              <p className="text-xl livishield-text-secondary mb-8 leading-relaxed">
                Medical inflation is on the rise making treatments expensive. If you get hospitalized for a critical illness or lifestyle disease, you may end up losing all your savings. The only way to afford quality medical treatment during a health emergency is by buying a health insurance policy.
              </p>
            </div>
            
            {/* Right Side - Circular Wheel */}
            <div className="flex justify-center">
              <div className="relative w-96 h-96">
                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 livishield-bg-accent rounded-full flex items-center justify-center z-10">
                  <div className="text-center">
                    <Heart className="h-12 w-12 text-white mx-auto mb-2" />
                    <p className="text-white font-bold text-sm">Health Benefits</p>
                  </div>
                </div>
                
                {/* Benefit Circles */}
                {[
                  { title: "Beat Medical Inflation", angle: 0, description: "Pay medical bills despite rising costs" },
                  { title: "Quality Treatment", angle: 51.4, description: "Afford the best medical care" },
                  { title: "Fight Lifestyle Diseases", angle: 102.8, description: "Cover long-term treatments" },
                  { title: "Protect Savings", angle: 154.2, description: "Keep your hard-earned money safe" },
                  { title: "Cashless Facility", angle: 205.6, description: "Network hospital benefits" },
                  { title: "Tax Benefits", angle: 257, description: "Save under Section 80D" },
                  { title: "Peace of Mind", angle: 308.4, description: "Treatment without financial worry" }
                ].map((benefit, index) => {
                  const radius = 140;
                  const x = Math.cos((benefit.angle * Math.PI) / 180) * radius;
                  const y = Math.sin((benefit.angle * Math.PI) / 180) * radius;
                  
                  return (
                    <div
                      key={index}
                      className="absolute w-24 h-24 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`
                      }}
                    >
                      <div className="w-full h-full livishield-card rounded-full flex items-center justify-center livishield-hover-lift group-hover:scale-110 transition-all duration-300">
                        <div className="text-center p-2">
                          <div className="w-8 h-8 livishield-bg-light rounded-full flex items-center justify-center mx-auto mb-1">
                            <span className="text-xs font-bold livishield-text-accent">{index + 1}</span>
                          </div>
                          <p className="text-xs font-semibold livishield-text-primary leading-tight">{benefit.title}</p>
                        </div>
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <div className="livishield-card px-3 py-2 rounded-lg shadow-lg">
                          <p className="text-sm livishield-text-primary font-medium whitespace-nowrap">{benefit.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
            
          {/* Detailed Benefits Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {[
              {
                title: "Beat Medical Inflation",
                description: "A health insurance policy can help you pay your medical bills, including pre and post-hospitalization expenses, today as well as in future despite the rising medical costs."
              },
              {
                title: "Afford Quality Medical Treatment",
                description: "It helps you to afford the best quality medical treatment and care so that you can focus only on getting cured."
              },
              {
                title: "Fight Lifestyle Diseases",
                description: "It allows you to pay for the long-term treatment of lifestyle diseases like cancer, heart ailments, etc., that have been on the rise with the changing lifestyles."
              },
              {
                title: "Protect Your Savings",
                description: "It helps you to protect your hard-earned savings by covering your medical expenses so that you can avail the required treatment without any financial worries."
              },
              {
                title: "Avail Cashless Hospitalization Facility",
                description: "It allows you to obtain a cashless hospitalization facility at any of the network hospitals of your insurance provider by raising a cashless claim."
              },
              {
                title: "Get Tax Benefits",
                description: "It enables you to save tax on the health insurance premium that you've paid under section 80D of the Income Tax Act for better financial planning."
              },
              {
                title: "Ensure Peace of Mind",
                description: "It allows you to obtain medical treatment with peace of mind as you do not have to worry about paying hefty hospital bills."
              }
            ].map((benefit, index) => (
              <Card key={index} className="livishield-hover-lift livishield-card">
                <CardHeader>
                  <CardTitle className="text-lg livishield-text-primary flex items-center space-x-3">
                    <div className="w-8 h-8 livishield-bg-accent rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{index + 1}</span>
                    </div>
                    <span>{benefit.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="livishield-text-secondary">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Buy Online */}
      <section className="py-20 livishield-section-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              Why Should you Buy Health Insurance Plans Online?
            </h2>
            <p className="text-xl livishield-text-secondary max-w-3xl mx-auto">
              Buying a health insurance policy online comes with several benefits. Take a look at them below:
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Easier to Compare Plans",
                description: "It is easier to compare health insurance plans from different insurers online at websites like Policybazaar.com to make an informed decision."
              },
              {
                title: "More Convenient",
                description: "It is more convenient to buy the policy online as you do not have to visit the branch of the insurance company or take an appointment to meet an insurance agent."
              },
              {
                title: "Online Discounts",
                description: "It allows you to avail discount on premiums for buying the policy online."
              },
              {
                title: "Lower Premiums",
                description: "Health plans are available for a lower premium online as insurance companies save a lot on operational costs."
              },
              {
                title: "Minimal Paperwork",
                description: "The process of buying a health insurance policy online involves minimum to zero paperwork."
              },
              {
                title: "Policy Available 24x7",
                description: "A health insurance policy can be purchased online any time of the day, even on public holidays, which is not possible in offline buying."
              },
              {
                title: "Digital Payment Options",
                description: "It allows you to avoid cash payments and use digital payment methods to pay the premium online safely."
              },
              {
                title: "Time-saving",
                description: "It saves you a lot of time as the policy is issued within a few minutes of buying."
              }
            ].map((benefit, index) => (
              <Card key={index} className="livishield-hover-lift livishield-card">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 livishield-bg-accent rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <CardTitle className="text-lg livishield-text-primary">{benefit.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="livishield-text-secondary text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What's Not Covered */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold livishield-text-primary mb-3">
              What is Not Covered in a Health Insurance Plan?
            </h2>
          </div>
          
          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
            {/* Left Side - Circular Wheel */}
            <div className="flex justify-center">
              <div className="relative w-96 h-96">
                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500 rounded-full flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-red-500 text-2xl font-bold">✕</span>
                    </div>
                    <p className="text-white font-bold text-sm">Not Covered</p>
                  </div>
                </div>
                
                {/* Exclusion Circles */}
                {[
                  { title: "Initial 30 Days", angle: 0, description: "Claims during first 30 days" },
                  { title: "Pre-existing", angle: 51.4, description: "2-4 years waiting period" },
                  { title: "Critical Illness", angle: 102.8, description: "90-day waiting period" },
                  { title: "War/Terrorism", angle: 154.2, description: "Nuclear activity injuries" },
                  { title: "Self-inflicted", angle: 205.6, description: "Suicide attempts" },
                  { title: "Terminal Illness", angle: 257, description: "Similar diseases" },
                  { title: "Cosmetic Surgery", angle: 308.4, description: "Plastic surgery" }
                ].map((exclusion, index) => {
                  const radius = 140;
                  const x = Math.cos((exclusion.angle * Math.PI) / 180) * radius;
                  const y = Math.sin((exclusion.angle * Math.PI) / 180) * radius;
                  
                  return (
                    <div
                      key={index}
                      className="absolute w-24 h-24 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`
                      }}
                    >
                      <div className="w-full h-full livishield-card rounded-full flex items-center justify-center livishield-hover-lift group-hover:scale-110 transition-all duration-300">
                        <div className="text-center p-2">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1">
                            <span className="text-xs font-bold text-red-600">{index + 1}</span>
                          </div>
                          <p className="text-xs font-semibold text-red-600 leading-tight">{exclusion.title}</p>
                        </div>
                      </div>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <div className="livishield-card px-3 py-2 rounded-lg shadow-lg">
                          <p className="text-sm livishield-text-primary font-medium whitespace-nowrap">{exclusion.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* Right Side - Text Content */}
            <div>
              <p className="text-xl livishield-text-secondary mb-8 leading-relaxed">
                The following medical expenses and situations are usually not covered in a health insurance plan:
              </p>
            </div>
          </div>
            
          {/* Detailed Exclusions Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {[
              {
                title: "Initial 30 Days Waiting",
                description: "Unless there is an accidental emergency, claims arising during the initial 30 days of buying a health insurance plan are not covered."
              },
              {
                title: "Pre-existing Diseases",
                description: "Coverage of pre-existing diseases is subject to a waiting period of 2 to 4 years from policy inception."
              },
              {
                title: "Critical Illness Waiting",
                description: "Critical illnesses coverage usually comes with a 90-day waiting period before claims can be made."
              },
              {
                title: "War & Terrorism",
                description: "Injuries caused by war, terrorism, or nuclear activity are typically excluded from coverage."
              },
              {
                title: "Self-inflicted Injuries",
                description: "Self-inflicted injuries or suicide attempts are not covered under health insurance policies."
              },
              {
                title: "Terminal Illnesses",
                description: "Terminal illnesses and other diseases of a similar nature may have limited or no coverage."
              },
              {
                title: "Cosmetic Surgery",
                description: "Cosmetic/plastic surgery and replacement of hormone surgery are generally not covered."
              },
              {
                title: "Dental Treatments",
                description: "Non-accidental dental treatments are typically excluded from standard health insurance plans."
              },
              {
                title: "Bed Rest & Rehabilitation",
                description: "Extended bed rest and rehabilitation costs may not be covered under certain policies."
              },
              {
                title: "Diagnostic Tests",
                description: "Certain diagnostic tests may be excluded or have specific conditions for coverage."
              },
              {
                title: "Adventure Sports",
                description: "Claims arising out of adventure sports injuries are typically not covered by health insurance."
              }
            ].map((exclusion, index) => (
              <Card key={index} className="livishield-hover-lift livishield-card">
                <CardHeader>
                  <CardTitle className="text-lg livishield-text-primary flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">{index + 1}</span>
                    </div>
                    <span>{exclusion.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="livishield-text-secondary">{exclusion.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How Our Health Insurance Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting the healthcare you need is simple with our streamlined process.
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Choose Your Plan", description: "Select the health plan that best fits your needs and budget" },
              { step: "2", title: "Find Providers", description: "Use our provider directory to find doctors and specialists in your area" },
              { step: "3", title: "Get Care", description: "Visit your chosen healthcare provider and receive the care you need" },
              { step: "4", title: "We Handle the Rest", description: "We work directly with providers to handle billing and claims" }
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
            Ready to Protect Your Health?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of families who trust LiviShield for their health insurance needs. 
            Compare plans and get covered today.
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="livishield-btn-secondary">
              Explore Health Insurance Plans
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HealthInsurance;