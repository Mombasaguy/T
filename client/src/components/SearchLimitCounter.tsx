import { Link } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

interface SearchLimitCounterProps {
  searchesUsed: number;
  searchesLimit: number;
  plan: string;
}

export function SearchLimitCounter({ searchesUsed, searchesLimit, plan }: SearchLimitCounterProps) {
  const percentage = Math.min((searchesUsed / searchesLimit) * 100, 100);
  const remaining = Math.max(searchesLimit - searchesUsed, 0);
  const isNearLimit = remaining <= 2 && remaining > 0;
  const isAtLimit = remaining === 0;

  if (plan !== 'free') {
    return null;
  }

  return (
    <div className={`p-3 rounded-lg border mb-4 ${
      isAtLimit 
        ? 'bg-red-50 border-red-200' 
        : isNearLimit 
          ? 'bg-amber-50 border-amber-200' 
          : 'bg-gray-50 border-gray-200'
    }`} data-testid="search-limit-counter">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          Monthly Searches
        </span>
        <span className={`text-sm font-medium ${
          isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-gray-600'
        }`}>
          {searchesUsed} / {searchesLimit}
        </span>
      </div>
      
      <Progress 
        value={percentage} 
        className={`h-2 ${isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-amber-500' : ''}`} 
      />
      
      {isAtLimit ? (
        <div className="mt-3">
          <p className="text-sm text-red-700 mb-2">
            You've used all your free searches this month. Each search query counts as one search.
          </p>
          <Link href="/pricing">
            <Button size="sm" className="w-full" data-testid="button-upgrade-search-limit">
              <Zap className="w-4 h-4 mr-1" />
              Upgrade to Continue
            </Button>
          </Link>
        </div>
      ) : isNearLimit ? (
        <p className="text-xs text-amber-700 mt-2">
          {remaining} {remaining === 1 ? 'search' : 'searches'} remaining. Each search query you run counts as one search.
        </p>
      ) : (
        <p className="text-xs text-gray-500 mt-2">
          {remaining} {remaining === 1 ? 'search' : 'searches'} remaining this month
        </p>
      )}
    </div>
  );
}
