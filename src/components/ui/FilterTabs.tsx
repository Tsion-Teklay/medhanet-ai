import { MaterialIcon } from '@/components/ui/MaterialIcon'

type FilterTabsProps<T extends string> = {
  tabs: { id: T; icon: string; label: string }[]
  active: T
  onChange: (id: T) => void
}

export function FilterTabs<T extends string>({ tabs, active, onChange }: FilterTabsProps<T>) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
      {tabs.map(({ id, icon, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={[
            'flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-2 font-label-md transition-colors active:scale-95',
            active === id
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-variant',
          ].join(' ')}
        >
          <MaterialIcon icon={icon} className="text-sm" />
          {label}
        </button>
      ))}
    </div>
  )
}
