"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { History, Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function coordinatePart(value) {
  return value === null || value === undefined ? "" : Number(value).toFixed(6);
}

function placeIdentity(place) {
  return ["place", normalize(place.display_name || place.name), coordinatePart(place.latitude), coordinatePart(place.longitude)].join("-");
}

function placeSuggestion(place) {
  const label = place.name || place.display_name || "Selected location";
  const sublabel = [place.city, place.state, place.country].filter(Boolean).join(", ") || place.display_name;

  return {
    id: placeIdentity(place),
    type: "place",
    label,
    sublabel,
    city: place.city || label,
    latitude: place.latitude,
    longitude: place.longitude,
    displayName: place.display_name || label,
    state: place.state,
    country: place.country,
    payload: place,
  };
}

function dedupeById(items) {
  const seen = new Set();
  return items.filter((item) => {
    if (!item || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function SearchBar({ query, onChange, onFocus, onKeyDown, loading }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder="Search any city, locality or landmark..."
        className="pl-9 pr-9"
        autoComplete="off"
      />
      {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-aurora-cyan" />}
    </div>
  );
}

export function SearchSuggestions({ suggestions, activeIndex, onHover, onSelect }) {
  if (!suggestions.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="absolute z-40 mt-2 max-h-80 w-full overflow-hidden rounded-md border border-white/10 bg-void-800/95 shadow-xl backdrop-blur-xl"
    >
      {suggestions.map((item, index) => (
        <motion.button
          key={item.id}
          type="button"
          onMouseEnter={() => onHover(index)}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(item)}
          className={cn(
            "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
            index === activeIndex ? "bg-white/10" : "hover:bg-white/[0.06]"
          )}
        >
          <MapPin className="h-4 w-4 shrink-0 text-aurora-cyan" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-foreground">{item.label}</span>
            <span className="block truncate text-[11px] text-muted-foreground">{item.sublabel || "Place"}</span>
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}

export function SearchHistory({ items, onSelect }) {
  if (!items.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18 }}
      className="absolute z-40 mt-2 w-full overflow-hidden rounded-md border border-white/10 bg-void-800/95 shadow-xl backdrop-blur-xl"
    >
      <div className="flex items-center gap-2 px-4 py-2 text-[11px] uppercase tracking-[0.22em] text-white/45">
        <History className="h-3.5 w-3.5" /> Recent
      </div>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(item)}
          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.06]"
        >
          <MapPin className="h-4 w-4 shrink-0 text-aurora-cyan" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm text-foreground">{item.label}</span>
            <span className="block truncate text-[11px] text-muted-foreground">{item.sublabel || item.displayName}</span>
          </span>
        </button>
      ))}
    </motion.div>
  );
}

export function SuperSearch({ apiBaseUrl, recentSearches = [], onSelectLocation, onError, className }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef(new Map());

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const search = debouncedQuery.trim();
    setActiveIndex(0);

    if (search.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return undefined;
    }

    const cacheKey = normalize(search);
    if (cacheRef.current.has(cacheKey)) {
      setSuggestions(cacheRef.current.get(cacheKey));
      return undefined;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`${apiBaseUrl}/locations/search?q=${encodeURIComponent(search)}&limit=6`, { signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json().catch(() => []);
        if (!response.ok) throw new Error(payload.detail || "Unable to search locations.");
        return payload;
      })
      .then((places) => {
        const next = dedupeById(places.map(placeSuggestion));
        cacheRef.current.set(cacheKey, next);
        setSuggestions(next);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setSuggestions([]);
          onError?.(error.message || "Unable to search locations.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [apiBaseUrl, debouncedQuery, onError]);

  const selectItem = (item) => {
    setQuery(item.label);
    setFocused(false);
    onSelectLocation?.(item);
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      setFocused(false);
      return;
    }

    if (!focused || !suggestions.length) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
    }

    if (event.key === "Enter") {
      event.preventDefault();
      selectItem(suggestions[activeIndex]);
    }
  };

  const showSuggestions = focused && debouncedQuery.trim() && suggestions.length > 0;
  const showHistory = focused && !debouncedQuery.trim() && recentSearches.length > 0;

  return (
    <div className={cn("relative w-full max-w-md", className)} onBlur={() => setTimeout(() => setFocused(false), 120)}>
      <SearchBar
        query={query}
        onChange={(value) => {
          setQuery(value);
          setFocused(true);
        }}
        onFocus={() => setFocused(true)}
        onKeyDown={onKeyDown}
        loading={loading}
      />

      <AnimatePresence>
        {showSuggestions && <SearchSuggestions suggestions={suggestions} activeIndex={activeIndex} onHover={setActiveIndex} onSelect={selectItem} />}
        {showHistory && <SearchHistory items={recentSearches} onSelect={selectItem} />}
      </AnimatePresence>
    </div>
  );
}
