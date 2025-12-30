import { Shield, Eye, Users, CheckCircle, Mail } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Compliance() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <header className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Responsible Candidate Sourcing
          </h1>
          <p className="text-lg text-gray-600">
            TalentPilot is designed to support ethical, transparent, and responsible recruiting.
          </p>
        </header>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Data Sources</h2>
              <p className="text-gray-600 mb-4">
                TalentPilot uses <strong>publicly available professional information</strong>, including:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  Public profiles
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  Personal websites and portfolios
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  Public writing, talks, and publications
                </li>
              </ul>
              <p className="text-gray-600 mt-4">
                TalentPilot does not access private data.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Recruiter Control</h2>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  Recruiters decide who to contact
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  No automated outreach
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  No messaging without review
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Transparency</h2>
              <p className="text-gray-600 mb-4">
                Each candidate includes:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  Source visibility
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  Context for why they surfaced
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  Clear relevance indicators
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Compliance Support</h2>
            <p className="text-gray-600 mb-4">
              TalentPilot is designed to align with responsible recruiting practices, including:
            </p>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                Respect for public data boundaries
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                Clear sourcing visibility
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                Recruiter-driven engagement
              </li>
            </ul>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Mail className="w-4 h-4" />
              <span>For compliance questions, contact: support@talentpilot.ai</span>
            </div>
          </div>
        </section>

        <div className="text-center pt-8 border-t border-gray-200">
          <Link href="/search">
            <Button className="bg-gray-900 text-white hover:bg-gray-800">
              Start Sourcing Candidates
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
