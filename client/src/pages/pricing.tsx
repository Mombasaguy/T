import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Check, Zap, Users, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
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
  buttonText: string;
  plan?: string;
  featured?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    price: "$0",
    priceNote: "/month",
    description: "For light sourcing and evaluation",
    features: [
      "10 candidate searches per month",
      "Full access to search and candidate previews",
      "Save and review candidates",
      "CSV export",
    ],
    buttonText: "Start Free",
  },
  {
    name: "Professional",
    price: "$99",
    priceNote: "/month",
    description: "For recruiters sourcing regularly",
    features: [
      "200 candidate searches per month",
      "Save and manage candidates",
      "Candidate notes, tags, and status tracking",
      "Personalized outreach drafting",
      "CSV export",
    ],
    buttonText: "Get Professional",
    plan: "professional",
    featured: true,
  },
  {
    name: "Team",
    price: "$299",
    priceNote: "/month",
    description: "For recruiting teams and agencies",
    features: [
      "1,000 candidate searches per month",
      "Unlimited team members",
      "Shared candidate workspace",
      "Outreach drafting for the whole team",
      "CSV export",
    ],
    buttonText: "Get Team",
    plan: "team",
  },
];

const includedFeatures = [
  "Public-profile sourcing",
  "Explainable matches",
  "CSV export",
  "No long-term contracts",
];

const faqs = [
  {
    question: "What counts as a search?",
    answer:
      "Each time you run a query - whether describing a candidate like 'senior React engineer with fintech experience' or using a profile URL to find similar candidates - that counts as one search. Refining your search with a new query uses another search. Viewing candidate details, saving candidates, and exporting don't count toward your limit.",
  },
  {
    question: "How is this different from LinkedIn Recruiter?",
    answer:
      "TalentPilot searches across public professional profiles including LinkedIn, GitHub, personal sites, and blogs - giving you access to candidates you won't find on LinkedIn alone. Plus, we explain why each candidate surfaced so you can make faster decisions.",
  },
  {
    question: "What data sources do you use?",
    answer:
      "TalentPilot uses publicly available professional information including public profiles, personal websites and portfolios, and public writing, talks, and publications. We do not access private data.",
  },
  {
    question: "Can I export candidate lists?",
    answer:
      "Yes! All plans include CSV export. Download your search results, candidate lists, and tracking data anytime.",
  },
  {
    question: "What's your refund policy?",
    answer:
      "If you're not satisfied, cancel anytime - no questions asked. We don't lock you into long-term contracts.",
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
        window.open(data.url, '_blank');
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
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" data-testid="text-pricing-title">
            Simple, transparent pricing for recruiting teams
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits how often you source candidates.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative rounded-xl p-6 ${
                tier.featured
                  ? "bg-gray-900 text-white border-2 border-gray-900"
                  : "bg-white border-2 border-gray-200"
              }`}
              data-testid={`card-pricing-${tier.name.toLowerCase()}`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-2 ${tier.featured ? "text-white" : "text-gray-900"}`}>
                  {tier.name}
                </h3>
                <p className={`text-sm ${tier.featured ? "text-gray-300" : "text-gray-600"}`}>
                  {tier.description}
                </p>
              </div>

              <div className="mb-6">
                <span className={`text-4xl font-bold ${tier.featured ? "text-white" : "text-gray-900"}`}>
                  {tier.price}
                </span>
                <span className={`text-sm ${tier.featured ? "text-gray-300" : "text-gray-500"}`}>
                  {tier.priceNote}
                </span>
              </div>

              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.featured ? "text-blue-400" : "text-gray-500"}`} />
                    <span className={`text-sm ${tier.featured ? "text-gray-200" : "text-gray-600"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {tier.plan ? (
                <Button
                  onClick={() => handleSubscribe(tier.plan!)}
                  disabled={loadingPlan === tier.plan}
                  className={`w-full ${
                    tier.featured
                      ? "bg-white text-gray-900 hover:bg-gray-100"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                  data-testid={`button-subscribe-${tier.name.toLowerCase()}`}
                >
                  {loadingPlan === tier.plan ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    tier.buttonText
                  )}
                </Button>
              ) : (
                <Link href="/search">
                  <Button
                    variant="outline"
                    className="w-full"
                    data-testid="button-start-free"
                  >
                    {tier.buttonText}
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-16">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">All plans include:</h3>
          <div className="flex flex-wrap gap-4">
            {includedFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-gray-400" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  data-testid={`button-faq-${idx}`}
                >
                  <span className="font-medium text-gray-900 text-sm">{faq.question}</span>
                  {expandedFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 pb-4">
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">Ready to find better candidates?</p>
          <Link href="/search">
            <Button className="bg-gray-900 text-white hover:bg-gray-800" data-testid="button-cta-start">
              Find Candidates Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
