import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import timezones from '@/lib/timezones'; // You'll need to create this

interface TimezoneSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimezoneSelect({ value, onChange }: TimezoneSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select timezone" />
      </SelectTrigger>
      <SelectContent>
        {timezones.map((tz) => (
          <SelectItem key={tz.value} value={tz.value}>
            {tz.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 