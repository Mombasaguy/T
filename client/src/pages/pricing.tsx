import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full px-4 py-1.5 mb-6">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-blue-300">LinkedIn Recruiter: $2,040/year</span>
            <ArrowRight className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-green-400">We're $99/month</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-pricing-title">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Find Better Candidates.
            </span>
            <br />
            <span className="text-white">Pay 10x Less.</span>
          </h1>
          
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Search 1 billion profiles across LinkedIn, GitHub, and personal sites.
            AI-powered outreach that gets responses.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {pricingTiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative ${
                tier.featured
                  ? "border-2 border-purple-500/50 bg-gradient-to-b from-purple-500/10 to-transparent"
                  : "border-slate-700 bg-slate-800/50"
              }`}
              data-testid={`card-pricing-${tier.name.toLowerCase()}`}
            >
              {tier.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  {tier.name === "Free" && <Zap className="h-5 w-5 text-slate-400" />}
                  {tier.name === "Professional" && <Sparkles className="h-5 w-5 text-purple-400" />}
                  {tier.name === "Team" && <Users className="h-5 w-5 text-blue-400" />}
                  <span className="text-white">{tier.name}</span>
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">{tier.price}</span>
                  <span className="text-slate-400">{tier.priceNote}</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">{tier.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <Check className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {tier.comparison && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <p className="text-xs text-green-400">{tier.comparison}</p>
                  </div>
                )}

                {tier.plan ? (
                  <Button
                    onClick={() => handleSubscribe(tier.plan!)}
                    disabled={loadingPlan === tier.plan}
                    className={`w-full ${
                      tier.featured
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        : ""
                    }`}
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
                    <Button variant="outline" className="w-full" data-testid="button-start-free">
                      {tier.buttonText}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <Card
                key={index}
                className="border-slate-700 bg-slate-800/50 cursor-pointer"
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                data-testid={`card-faq-${index}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-white">{faq.question}</h3>
                    {expandedFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                  {expandedFaq === index && (
                    <p className="mt-3 text-sm text-slate-400">{faq.answer}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <footer className="text-center mt-16 pt-8 border-t border-slate-800">
          <p className="text-sm text-slate-500">
            Need enterprise pricing? <a href="mailto:sales@example.com" className="text-blue-400 hover:underline">Contact our sales team</a>
          </p>
        </footer>
      </div>
    </div>
  );
}
