import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Sparkles, Zap, Users, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";

const PRICE_IDS = {
  professional: import.meta.env.VITE_STRIPE_PRICE_PROFESSIONAL || "",
  team: import.meta.env.VITE_STRIPE_PRICE_TEAM || "",
};

interface PricingTier {
  name: string;
  price: string;
  priceNote?: string;
  description: string;
  features: string[];
  comparison?: string;
  buttonText: string;
  plan?: string;
  featured?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    priceNote: "/month",
    description: "Get started with basic search",
    features: [
      "10 searches per month",
      "Search LinkedIn, GitHub, blogs",
      "Export to CSV",
      "View candidate profiles",
    ],
    buttonText: "Start Free",
  },
  {
    name: "Professional",
    price: "$99",
    priceNote: "/month",
    description: "Everything you need for serious recruiting",
    features: [
      "200 searches per month",
      "AI-powered email generation",
      '"Find Similar" from any URL',
      "Advanced filters",
      "Unlimited exports",
      "Priority support",
    ],
    comparison: "vs. LinkedIn Recruiter Lite: Save $852/year",
    buttonText: "Start 14-Day Trial",
    plan: "professional",
    featured: true,
  },
  {
    name: "Team",
    price: "$299",
    priceNote: "/month",
    description: "For growing recruiting teams",
    features: [
      "1,000 searches per month",
      "Up to 10 team members",
      "Shared candidate lists",
      "Team collaboration",
      "Slack integration",
      "Dedicated support",
    ],
    comparison: "vs. LinkedIn Corporate (5 seats): Save $61,212/year",
    buttonText: "Start Team Trial",
    plan: "team",
  },
];

const faqs = [
  {
    question: "How is this different from LinkedIn Recruiter?",
    answer:
      "We search across 1 billion+ profiles on LinkedIn, GitHub, personal sites, and blogs - giving you access to candidates you won't find on LinkedIn alone. Plus, our AI helps you craft personalized outreach at a fraction of the cost.",
  },
  {
    question: "What's included in AI email generation?",
    answer:
      "Our AI analyzes each candidate's profile, recent activity, and skills to generate personalized outreach emails. Each email is tailored to reference their specific work and achievements.",
  },
  {
    question: "Can I export candidate lists?",
    answer:
      "Yes! All plans include CSV export. Download your search results, candidate lists, and tracking data anytime.",
  },
  {
    question: "What's your refund policy?",
    answer:
      "We offer a 14-day free trial on paid plans. If you're not satisfied, cancel anytime - no questions asked. For annual plans, we offer prorated refunds.",
  },
];

export default function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSubscribe = async (plan: string) => {
    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS];
    
    if (!priceId) {
      console.error("Price ID not configured for plan:", plan);
      return;
    }

    setLoadingPlan(plan);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId,
          plan,
        }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-white" />
            <span className="text-white font-medium">LinkedIn Recruiter: $2,040/year</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-300 font-bold text-lg">We're $99/month</span>
            <ArrowRight className="w-5 h-5 text-green-300" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" data-testid="text-pricing-title">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Find Better Candidates.
            </span>
            <br />
            <span className="text-white">Pay 10x Less.</span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Search 1 billion profiles across LinkedIn, GitHub, and personal sites.
            AI-powered outreach that gets responses.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 pb-24">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl p-8 ${
                tier.featured
                  ? "bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300"
                  : "bg-gray-800 border-2 border-gray-700"
              }`}
              data-testid={`card-pricing-${tier.name.toLowerCase()}`}
            >
              {tier.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                {tier.name === "Free" && <Zap className={`w-8 h-8 ${tier.featured ? "text-purple-600" : "text-blue-400"}`} />}
                {tier.name === "Professional" && <Sparkles className={`w-8 h-8 ${tier.featured ? "text-purple-600" : "text-blue-400"}`} />}
                {tier.name === "Team" && <Users className={`w-8 h-8 ${tier.featured ? "text-purple-600" : "text-blue-400"}`} />}
                <h3 className={`text-2xl font-bold ${tier.featured ? "text-gray-900" : "text-white"}`}>
                  {tier.name}
                </h3>
              </div>

              <div className="mb-4">
                <span className={`text-5xl font-bold ${tier.featured ? "text-gray-900" : "text-white"}`}>
                  {tier.price}
                </span>
                <span className={`text-lg ${tier.featured ? "text-gray-600" : "text-gray-400"}`}>
                  {tier.priceNote}
                </span>
              </div>

              <p className={`mb-6 ${tier.featured ? "text-gray-700" : "text-gray-300"}`}>
                {tier.description}
              </p>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${tier.featured ? "text-green-600" : "text-green-400"}`} />
                    <span className={tier.featured ? "text-gray-700" : "text-gray-300"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {tier.comparison && (
                <div className={`mb-6 p-3 rounded-lg ${
                  tier.featured
                    ? "bg-green-100 text-green-800"
                    : "bg-green-900/30 text-green-300"
                } text-sm font-medium text-center`}>
                  {tier.comparison}
                </div>
              )}

              {tier.plan ? (
                <Button
                  onClick={() => handleSubscribe(tier.plan!)}
                  disabled={loadingPlan === tier.plan}
                  className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg h-auto"
                  data-testid={`button-subscribe-${tier.plan}`}
                >
                  {loadingPlan === tier.plan ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Redirecting...
                    </>
                  ) : (
                    tier.buttonText
                  )}
                </Button>
              ) : (
                <Link href="/search">
                  <Button 
                    className={`w-full py-4 rounded-xl font-semibold h-auto ${
                      tier.featured
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "bg-gray-700 text-white hover:bg-gray-600"
                    }`}
                    data-testid="button-start-free"
                  >
                    {tier.buttonText}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

      </div>

      <div className="bg-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-700/50 rounded-xl p-6 cursor-pointer"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                data-testid={`card-faq-${index}`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-medium text-white">{faq.question}</h3>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                  )}
                </div>
                {expandedFaq === index && (
                  <p className="mt-4 text-gray-300">{faq.answer}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
