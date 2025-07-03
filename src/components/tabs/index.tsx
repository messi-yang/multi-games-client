import { Text } from '../texts/text';

type Props<T extends string> = {
  tabs: {
    label: string;
    value: T;
  }[];
  value: T;
  onChange: (value: T) => void;
};

export function Tabs<T extends string>({ tabs, value, onChange }: Props<T>) {
  return (
    <div className="flex flex-row gap-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg py-2 px-4">
      {tabs.map((tab) => (
        <div
          key={tab.value}
          className={`flex flex-row cursor-pointer p-2 rounded-lg ${value === tab.value ? 'bg-white/20' : ''}`}
          onClick={() => onChange(tab.value)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onChange(tab.value);
            }
          }}
        >
          <Text>{tab.label}</Text>
        </div>
      ))}
    </div>
  );
}
