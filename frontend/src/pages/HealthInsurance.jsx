import { memo, useMemo } from "react";
import Navbar from "../components/Navbar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { 
  Heart, 
  CheckCircle,
  ArrowRight
} from "lucide-react";
import "../styles/theme.css";

// Data constants - optimized and consolidated
const HEALTH_INSURANCE_DATA = {
  howItWorks: [
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
  ],
  
  benefits: [
    { title: "Beat Medical Inflation", description: "Pay medical bills despite rising costs" },
    { title: "Quality Treatment", description: "Afford the best medical care" },
    { title: "Fight Lifestyle Diseases", description: "Cover long-term treatments" },
    { title: "Protect Savings", description: "Keep your hard-earned money safe" },
    { title: "Cashless Facility", description: "Network hospital benefits" },
    { title: "Tax Benefits", description: "Save under Section 80D" },
    { title: "Peace of Mind", description: "Treatment without financial worry" }
  ],
  
  detailedBenefits: [
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
  ],
  
  onlineBenefits: [
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
  ],
  
  exclusions: [
    { title: "Initial 30 Days", description: "Claims during first 30 days" },
    { title: "Pre-existing", description: "2-4 years waiting period" },
    { title: "Critical Illness", description: "90-day waiting period" },
    { title: "War/Terrorism", description: "Nuclear activity injuries" },
    { title: "Self-inflicted", description: "Suicide attempts" },
    { title: "Terminal Illness", description: "Similar diseases" },
    { title: "Cosmetic Surgery", description: "Plastic surgery" }
  ],
  
  detailedExclusions: [
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
  ],
  
  processSteps: [
    { step: "1", title: "Choose Your Plan", description: "Select the health plan that best fits your needs and budget" },
    { step: "2", title: "Find Providers", description: "Use our provider directory to find doctors and specialists in your area" },
    { step: "3", title: "Get Care", description: "Visit your chosen healthcare provider and receive the care you need" },
    { step: "4", title: "We Handle the Rest", description: "We work directly with providers to handle billing and claims" }
  ]
};

// Optimized memoized components
const HeroStats = memo(() => (
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
));

const CircularBenefit = memo(({ benefit, index, radius = 140 }) => {
  const angle = index * 51.4;
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;
  
  return (
    <div
      className="absolute w-20 h-20 sm:w-24 sm:h-24 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`
      }}
      role="button"
      tabIndex={0}
      aria-label={`${benefit.title}: ${benefit.description}`}
    >
      <div className="w-full h-full livishield-card rounded-full flex items-center justify-center livishield-hover-lift group-hover:scale-110 transition-all duration-300">
        <div className="text-center p-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 livishield-bg-light rounded-full flex items-center justify-center mx-auto mb-1">
            <span className="text-xs font-bold livishield-text-accent">{index + 1}</span>
          </div>
          <p className="text-xs font-semibold livishield-text-primary leading-tight">{benefit.title}</p>
        </div>
      </div>
      
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <div className="livishield-card px-3 py-2 rounded-lg shadow-lg">
          <p className="text-sm livishield-text-primary font-medium whitespace-nowrap">{benefit.description}</p>
        </div>
      </div>
    </div>
  );
});

const CircularExclusion = memo(({ exclusion, index, radius = 140 }) => {
  const angle = index * 51.4;
  const x = Math.cos((angle * Math.PI) / 180) * radius;
  const y = Math.sin((angle * Math.PI) / 180) * radius;
  
  return (
    <div
      className="absolute w-20 h-20 sm:w-24 sm:h-24 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`
      }}
      role="button"
      tabIndex={0}
      aria-label={`Exclusion: ${exclusion.title} - ${exclusion.description}`}
    >
      <div className="w-full h-full livishield-card rounded-full flex items-center justify-center livishield-hover-lift group-hover:scale-110 transition-all duration-300">
        <div className="text-center p-2">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-1">
            <span className="text-xs font-bold text-red-600">{index + 1}</span>
          </div>
          <p className="text-xs font-semibold text-red-600 leading-tight">{exclusion.title}</p>
        </div>
      </div>
      
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <div className="livishield-card px-3 py-2 rounded-lg shadow-lg">
          <p className="text-sm livishield-text-primary font-medium whitespace-nowrap">{exclusion.description}</p>
        </div>
      </div>
    </div>
  );
});

const InfoCard = memo(({ item, index, variant = "default" }) => {
  const isExclusion = variant === "exclusion";
  const iconBgClass = isExclusion ? "bg-red-500" : "livishield-bg-accent";
  
  return (
    <Card className="livishield-hover-lift livishield-card h-full">
      <CardHeader>
        <CardTitle className="text-lg livishield-text-primary flex items-center space-x-3">
          <div className={`w-8 h-8 ${iconBgClass} rounded-full flex items-center justify-center flex-shrink-0`}>
            {isExclusion ? (
              <span className="text-sm font-bold text-white">{index + 1}</span>
            ) : (
              <CheckCircle className="h-4 w-4 text-white" />
            )}
          </div>
          <span className="leading-tight">{item.title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="livishield-text-secondary text-sm leading-relaxed">{item.description}</p>
      </CardContent>
    </Card>
  );
});

const ProcessStep = memo(({ item }) => (
  <div className="text-center">
    <div className="livishield-bg-accent w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-lg sm:text-2xl font-bold text-white">{item.step}</span>
    </div>
    <h3 className="text-lg sm:text-xl font-semibold livishield-text-primary mb-2">{item.title}</h3>
    <p className="livishield-text-secondary text-sm sm:text-base">{item.description}</p>
  </div>
));

const HealthInsurance = () => {
  // Memoize expensive calculations for better performance
  const benefitCircles = useMemo(() => 
    HEALTH_INSURANCE_DATA.benefits.map((benefit, index) => (
      <CircularBenefit key={benefit.title} benefit={benefit} index={index} />
    )), []
  );

  const exclusionCircles = useMemo(() => 
    HEALTH_INSURANCE_DATA.exclusions.map((exclusion, index) => (
      <CircularExclusion key={exclusion.title} exclusion={exclusion} index={index} />
    )), []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="livishield-gradient-bg text-white py-16 sm:py-20" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <Badge className="mb-4 livishield-badge-secondary">
                Health Insurance
              </Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-6 leading-tight">
                Complete 
                <span className="livishield-text-light"> Health Insurance</span> 
                Protection
              </h1>
              <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed">
                Comprehensive health coverage for you and your family. From routine checkups 
                to major medical procedures, we provide the protection you need to stay healthy 
                and financially secure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="livishield-btn-secondary" aria-label="Learn more about health insurance">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="livishield-card rounded-2xl p-6 sm:p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="livishield-bg-accent p-4 rounded-full">
                    <Heart className="h-12 w-12 sm:h-16 sm:w-16 text-white" aria-hidden="true" />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 livishield-text-primary">Your Health, Our Priority</h2>
                  <p className="livishield-text-secondary mb-4">Comprehensive care for every stage of life</p>
                  <HeroStats />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What is Health Insurance Section */}
      <section className="py-16 sm:py-20 bg-white" aria-labelledby="what-is-health-insurance">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 id="what-is-health-insurance" className="text-2xl sm:text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              What is Health Insurance?
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="relative rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src="/src/assets/health-insurance.jpg" 
                  alt="Healthcare professionals providing medical care" 
                  className="w-full h-64 sm:h-80 object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 livishield-gradient-bg opacity-20"></div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-base sm:text-lg livishield-text-secondary mb-6 leading-relaxed">
                In simple terms, when you buy health insurance, you get a financial cover up to a certain amount for the medical expenses you may incur in a year. It covers emergency and planned expenses for hospitalisation, day-care treatments, surgeries, pre and post-hospitalisation, ambulance charges.
              </p>
              <p className="text-base sm:text-lg livishield-text-secondary mb-6 leading-relaxed">
                Hence, a right health insurance policy helps you ward off unnecessary financial burden when a medical situation or emergency arises. Moreover, it also offers tax savings under Section 80D of the Income Tax, 1961 on the premium amount you pay to the insurer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Health Insurance Works */}
      <section className="py-16 sm:py-20 livishield-section-light" aria-labelledby="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 id="how-it-works" className="text-2xl sm:text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              How Health Insurance Works in India?
            </h2>
            <p className="text-lg sm:text-xl livishield-text-secondary max-w-3xl mx-auto">
              Here is how health insurance works in India:
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {HEALTH_INSURANCE_DATA.howItWorks.map((item, index) => (
              <InfoCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Key Benefits - Circular Design */}
      <section className="py-16 sm:py-20 bg-white" aria-labelledby="key-benefits">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 id="key-benefits" className="text-2xl sm:text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              Key Benefits to Buy a Health Insurance Plan
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-12 sm:mb-16">
            <div>
              <p className="text-lg sm:text-xl livishield-text-secondary mb-8 leading-relaxed">
                Medical inflation is on the rise making treatments expensive. If you get hospitalized for a critical illness or lifestyle disease, you may end up losing all your savings. The only way to afford quality medical treatment during a health emergency is by buying a health insurance policy.
              </p>
            </div>
            
            <div className="flex justify-center">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96" role="img" aria-label="Health insurance benefits visualization">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 livishield-bg-accent rounded-full flex items-center justify-center z-10">
                  <div className="text-center">
                    <Heart className="h-8 w-8 sm:h-12 sm:w-12 text-white mx-auto mb-2" aria-hidden="true" />
                    <p className="text-white font-bold text-xs sm:text-sm">Health Benefits</p>
                  </div>
                </div>
                {benefitCircles}
              </div>
            </div>
          </div>
            
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 sm:mt-16">
            {HEALTH_INSURANCE_DATA.detailedBenefits.map((benefit, index) => (
              <InfoCard key={benefit.title} item={benefit} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Buy Online */}
      <section className="py-16 sm:py-20 livishield-section-light" aria-labelledby="buy-online">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 id="buy-online" className="text-2xl sm:text-3xl lg:text-4xl font-bold livishield-text-primary mb-4">
              Why Should you Buy Health Insurance Plans Online?
            </h2>
            <p className="text-lg sm:text-xl livishield-text-secondary max-w-3xl mx-auto">
              Buying a health insurance policy online comes with several benefits. Take a look at them below:
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HEALTH_INSURANCE_DATA.onlineBenefits.map((benefit, index) => (
              <InfoCard key={benefit.title} item={benefit} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* What's Not Covered */}
      <section className="py-16 bg-white" aria-labelledby="not-covered">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="not-covered" className="text-2xl lg:text-3xl font-bold livishield-text-primary mb-3">
              What is Not Covered in a Health Insurance Plan?
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-12 sm:mb-16">
            <div className="flex justify-center">
              <div className="relative w-80 h-80 sm:w-96 sm:h-96" role="img" aria-label="Health insurance exclusions visualization">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 bg-red-500 rounded-full flex items-center justify-center z-10">
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-red-500 text-lg sm:text-2xl font-bold" aria-hidden="true">✕</span>
                    </div>
                    <p className="text-white font-bold text-xs sm:text-sm">Not Covered</p>
                  </div>
                </div>
                {exclusionCircles}
              </div>
            </div>
            
            <div>
              <p className="text-lg sm:text-xl livishield-text-secondary mb-8 leading-relaxed">
                The following medical expenses and situations are usually not covered in a health insurance plan:
              </p>
            </div>
          </div>
            
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 sm:mt-16">
            {HEALTH_INSURANCE_DATA.detailedExclusions.map((exclusion, index) => (
              <InfoCard key={exclusion.title} item={exclusion} index={index} variant="exclusion" />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20 bg-gray-50" aria-labelledby="process">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 id="process" className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How Our Health Insurance Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Getting the healthcare you need is simple with our streamlined process.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HEALTH_INSURANCE_DATA.processSteps.map((item, index) => (
              <ProcessStep key={item.step} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 livishield-section-primary text-white" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
            Ready to Protect Your Health?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of families who trust LiviShield for their health insurance needs. 
            Compare plans and get covered today.
          </p>
          <div className="flex justify-center">
            <Button size="lg" className="livishield-btn-secondary" aria-label="Explore health insurance plans">
              Explore Health Insurance Plans
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HealthInsurance;