import { MaterialIcon } from '@/components/ui/MaterialIcon'

type SearchInputProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchInput({ value, onChange, placeholder = 'Search...' }: SearchInputProps) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <MaterialIcon icon="search" className="text-outline" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-outline-variant bg-white py-3.5 pl-12 pr-4 font-body-md text-on-surface shadow-sm transition-all focus:border-transparent focus:ring-2 focus:ring-primary"
      />
    </div>
  )
}
