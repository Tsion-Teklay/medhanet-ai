import { MaterialIcon } from '@/components/ui/MaterialIcon'

type FloatingActionButtonProps = {
  label?: string
}

export function FloatingActionButton({ label = 'Add New Partner' }: FloatingActionButtonProps) {
  return (
    <button
      type="button"
      className="group fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-on-primary shadow-xl transition-all hover:scale-110 active:scale-95"
    >
      <MaterialIcon icon="add" className="text-3xl" />
      <span className="absolute right-full mr-4 whitespace-nowrap rounded-lg bg-on-surface px-3 py-1 text-xs text-surface opacity-0 transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  )
}
