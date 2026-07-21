"use client";

import { useEffect, useMemo, useState } from "react";
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

function stationIdentity(station) {
  if (station.station_id !== null && station.station_id !== undefined) {
    return `station-${station.station_id}`;
  }

  return [
    "station",
    normalize(station.station),
    normalize(station.city),
    coordinatePart(station.latitude),
    coordinatePart(station.longitude),
  ].join("-");
}

function citySuggestion(query) {
  const city = query.trim();
  if (!city) return null;
  return {
    id: `city-${normalize(city)}`,
    type: "city",
    label: city,
    city,
  };
}

function stationSuggestion(station) {
  return {
    id: stationIdentity(station),
    type: "station",
    label: station.station,
    sublabel: station.city,
    city: station.city,
    station: station.station,
    stationId: station.station_id,
    latitude: station.latitude,
    longitude: station.longitude,
    provider: station.provider,
    payload: station,
  };
}

function matchesQuery(suggestion, query) {
  const q = normalize(query);
  if (!q) return false;

  return [suggestion.label, suggestion.sublabel, suggestion.city, suggestion.station, suggestion.provider].some((value) =>
    normalize(value).includes(q)
  );
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
        placeholder="Search city, then station..."
        className="pl-9 pr-9"
        autoComplete="off"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-aurora-cyan" />
      )}
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
            <span className="block truncate text-sm text-foreground">
              {item.type === "station" ? `${item.label}, ${item.city}` : item.label}
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">
              {item.type === "station" ? item.provider || item.city : "City"}
            </span>
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
          <span className="truncate text-sm text-foreground">
            {item.type === "station" ? `${item.label}, ${item.city}` : item.label}
          </span>
        </button>
      ))}
    </motion.div>
  );
}

export function SuperSearch({ stations = [], loadingStations = false, recentSearches = [], onSelectLocation, className }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const suggestions = useMemo(() => {
    const cityItem = citySuggestion(debouncedQuery);
    const stationItems = stations.map(stationSuggestion).filter((item) => matchesQuery(item, debouncedQuery));
    return dedupeById([cityItem, ...stationItems]).slice(0, 6);
  }, [debouncedQuery, stations]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery]);

  const selectItem = (item) => {
    setQuery(item.type === "station" ? `${item.label}, ${item.city}` : item.label);
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
        loading={loadingStations}
      />

      <AnimatePresence>
        {showSuggestions && (
          <SearchSuggestions
            suggestions={suggestions}
            activeIndex={activeIndex}
            onHover={setActiveIndex}
            onSelect={selectItem}
          />
        )}
        {showHistory && <SearchHistory items={recentSearches} onSelect={selectItem} />}
      </AnimatePresence>
    </div>
  );
}