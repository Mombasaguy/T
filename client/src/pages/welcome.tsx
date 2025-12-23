import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Search, Sparkles, Mail, ArrowRight, CreditCard, Loader2 } from "lucide-react";
import { Link, useSearch } from "wouter";

const steps = [
  {
    icon: Search,
    title: "Run your first search",
    description: "Search across 1B+ profiles on LinkedIn, GitHub, and personal sites",
  },
  {
    icon: Sparkles,
    title: 'Try "Find Similar" feature',
    description: "Paste any profile URL to discover similar candidates instantly",
  },
  {
    icon: Mail,
    title: "Generate an AI email",
    description: "Create personalized outreach that gets responses",
  },
];

export default function Welcome() {
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const searchParams = useSearch();

  useEffect(() => {
    const fetchSession = async () => {
      const params = new URLSearchParams(searchParams);
      const sessionId = params.get("session_id");
      
      if (sessionId) {
        try {
          const response = await fetch(`/api/stripe/checkout-session/${sessionId}`);
          const data = await response.json();
          
          if (data.customerId) {
            const custId = typeof data.customerId === 'string' ? data.customerId : data.customerId.id;
            localStorage.setItem("stripeCustomerId", custId);
            setCustomerId(custId);
          }
        } catch (error) {
          console.error("Failed to fetch session:", error);
        }
      } else {
        const storedCustomerId = localStorage.getItem("stripeCustomerId");
        if (storedCustomerId) {
          setCustomerId(storedCustomerId);
        }
      }
      setLoading(false);
    };

    fetchSession();
  }, [searchParams]);

  const handleOpenBillingPortal = async () => {
    const custId = customerId || localStorage.getItem("stripeCustomerId");
    
    if (!custId) {
      console.log("No customer ID found");
      return;
    }

    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: custId }),
      });

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Portal error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="border-slate-700 bg-slate-800/50" data-testid="card-welcome">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2" data-testid="text-welcome-title">
              Welcome to Candidate Command Center!
            </h1>
            
            <p className="text-slate-400 mb-8">
              Your subscription is active. Let's get you started finding amazing candidates.
            </p>

            <div className="space-y-4 mb-8 text-left">
              <h2 className="text-sm font-medium text-slate-300 uppercase tracking-wide">
                Get Started
              </h2>
              
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 rounded-lg bg-slate-900/50 border border-slate-700"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <step.icon className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{step.title}</h3>
                    <p className="text-sm text-slate-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/search">
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  data-testid="button-start-searching"
                >
                  Start Searching
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              
              <Button
                variant="outline"
                onClick={handleOpenBillingPortal}
                data-testid="button-manage-subscription"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          Questions? Contact us at support@example.com
        </p>
      </div>
    </div>
  );
}
