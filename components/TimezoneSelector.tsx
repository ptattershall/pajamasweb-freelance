'use client';

import { useState, useEffect } from 'react';
import {
  getStoredTimezone,
  setStoredTimezone,
  COMMON_TIMEZONES,
} from '@/lib/timezone-utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const USE_MY_LOCATION = '__browser__';

interface TimezoneSelectorProps {
  onTimezoneChange?: (timeZone: string) => void;
  showLabel?: boolean;
  className?: string;
}

export function TimezoneSelector({
  onTimezoneChange,
  showLabel = true,
  className = '',
}: TimezoneSelectorProps) {
  const [value, setValue] = useState<string>(USE_MY_LOCATION);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = getStoredTimezone();
    const isCommon = COMMON_TIMEZONES.some((t) => t.value === stored);
    setValue(isCommon ? stored : USE_MY_LOCATION);
  }, []);

  const handleChange = (newValue: string) => {
    const timeZone =
      newValue === USE_MY_LOCATION
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : newValue;
    setStoredTimezone(timeZone);
    setValue(newValue);
    onTimezoneChange?.(timeZone);
  };

  if (!mounted) {
    return (
      <div className={className}>
        {showLabel && (
          <Label htmlFor="timezone-select" className="text-muted-foreground text-sm">
            Display times in
          </Label>
        )}
        <Select disabled value={USE_MY_LOCATION}>
          <SelectTrigger id="timezone-select" className="w-[220px] mt-1">
            <SelectValue placeholder="Loading..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  const displayLabel =
    value === USE_MY_LOCATION
      ? `Use my location (${getStoredTimezone()})`
      : COMMON_TIMEZONES.find((t) => t.value === value)?.label ?? value;

  return (
    <div className={className}>
      {showLabel && (
        <Label htmlFor="timezone-select" className="text-muted-foreground text-sm">
          Display times in
        </Label>
      )}
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger id="timezone-select" className="w-[220px] mt-1" aria-label="Choose timezone for displaying booking times">
          <SelectValue placeholder="Choose timezone">{displayLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={USE_MY_LOCATION}>
            Use my location ({Intl.DateTimeFormat().resolvedOptions().timeZone})
          </SelectItem>
          {COMMON_TIMEZONES.map((tz) => (
            <SelectItem key={tz.value} value={tz.value}>
              {tz.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
