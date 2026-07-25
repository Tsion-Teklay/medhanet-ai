import { Link } from 'react-router-dom'
import { MaterialIcon } from '@/components/ui/MaterialIcon'

type SystemEvent = {
  id: string
  icon: string
  iconClassName: string
  title: string
  titleClassName?: string
  description: string
  time: string
  showLine?: boolean
}

const events: SystemEvent[] = [
  {
    id: '1',
    icon: 'store',
    iconClassName: 'bg-primary-container/10 text-primary',
    title: 'New Pharmacy Partner',
    description: '"Bole Heights Pharmacy" joined the network.',
    time: '2m ago',
  },
  {
    id: '2',
    icon: 'bolt',
    iconClassName: 'bg-error-container/10 text-error',
    title: 'Reservation Spike Detected',
    titleClassName: 'text-error',
    description: 'Unusual activity in Arada District pharmacy nodes.',
    time: '15m ago',
  },
  {
    id: '3',
    icon: 'auto_awesome',
    iconClassName: 'bg-surface-container-highest text-surface-tint',
    title: 'System Update',
    description: 'AI Model v2.4 successfully deployed and verified.',
    time: '1h ago',
  },
  {
    id: '4',
    icon: 'report',
    iconClassName: 'bg-secondary-container/50 text-secondary',
    title: 'User Report',
    description: 'Abebe Selassie reported a data inaccuracy in "Amoxicillin" pricing.',
    time: '3h ago',
    showLine: false,
  },
]

export function SystemEvents() {
  return (
    <div className="card-soft-shadow flex flex-col rounded-3xl border border-outline-variant/30 bg-surface-container-lowest">
      <div className="border-b border-outline-variant/20 p-6">
        <h3 className="font-title-md text-title-md text-on-surface">System Events</h3>
        <p className="text-label-sm text-secondary">Latest operational updates</p>
      </div>

      <div className="max-h-[500px] flex-grow space-y-6 overflow-y-auto p-6">
        {events.map((event) => (
          <div key={event.id} className="group flex gap-4">
            <div className="mt-1 flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-transform group-hover:scale-110 ${event.iconClassName}`}
              >
                <MaterialIcon icon={event.icon} />
              </div>
              {event.showLine !== false && (
                <div className="mt-2 h-full w-px bg-outline-variant/30" />
              )}
            </div>
            <div className={event.showLine !== false ? 'pb-2' : ''}>
              <p className={`text-body-md font-semibold text-on-surface ${event.titleClassName ?? ''}`}>
                {event.title}
              </p>
              <p className="mt-0.5 text-label-md text-secondary">{event.description}</p>
              <span className="mt-1 block text-label-sm text-secondary-fixed-dim">{event.time}</span>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/logs"
        className="m-6 rounded-xl border border-outline-variant py-3 text-center text-label-md font-semibold text-secondary transition-colors hover:bg-surface-container-low"
      >
        View All Activity
      </Link>
    </div>
  )
}
