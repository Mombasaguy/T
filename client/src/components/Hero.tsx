import { useState } from 'react';
import { useLocation } from 'wouter';

interface HeroProps {
  title: string;
  subtitle: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function Hero({ title, subtitle, placeholder = "Describe what you're looking for...", onSearch }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [, setLocation] = useLocation();

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    } else if (searchQuery.trim()) {
      setLocation(`/search?query=${encodeURIComponent(searchQuery)}`);
    } else {
      setLocation('/search');
    }
  };

  return (
    <section className="mx-auto max-w-3xl px-5 pb-12 pt-20 md:pt-28">
      <h1 className="text-3xl md:text-4xl font-semibold leading-tight tracking-tight text-gray-900">
        {title}
      </h1>

      <p className="mt-4 text-base text-gray-600 leading-relaxed">
        {subtitle}
      </p>

      <div className="mt-7">
        <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:outline-none"
            data-testid="input-hero-search"
          />

          <button
            type="button"
            onClick={handleSearch}
            className="mt-3 w-full rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
            data-testid="button-hero-search"
          >
            Get Started
          </button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
