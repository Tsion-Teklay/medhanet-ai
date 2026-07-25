import { MaterialIcon } from '@/components/ui/MaterialIcon'

const ADMIN_AVATAR =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAbudHiwgRhDeWTvaaLbqX-dDxDO241ScsHW8Fw-wCw0Xt7SVCP55-KZGG1jys2Nfx-rQ6GTuCrfkPQ_h7YkRoX2BPdotgteoUNe0tLMnmpJNg2eP-xLiEiqh70pwEpYjYNONB1s9BUf0qLEiChQTXaeV1EzgiNCXKvTrOG-o7Kvn86LM3fl175PzsvxJPBOxDIyhhN-50pb3R8bocM_kO9r71ulQIu-zFc-5ylVQA_vhH7T2kVvKdqQJPa3_54E-Z9z8pV3FOQRWo'

type TopAppBarProps = {
  title: string
  icon?: string
}

export function TopAppBar({ title, icon = 'clinical_notes' }: TopAppBarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-outline-variant bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-container-max items-center justify-between px-margin-desktop py-4">
        <div className="flex items-center gap-4">
          <MaterialIcon icon={icon} className="text-3xl text-primary" />
          <h2 className="font-headline-lg text-headline-lg font-bold tracking-tight text-primary">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <MaterialIcon
              icon="notifications"
              className="cursor-pointer text-secondary transition-colors hover:text-primary"
            />
            <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-error" />
          </div>

          <div className="group flex cursor-pointer items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="font-label-md text-label-md text-on-surface transition-colors group-hover:text-primary">
                Admin Profile
              </p>
              <p className="text-label-sm text-secondary">Superuser</p>
            </div>
            <img
              className="h-10 w-10 rounded-full border-2 border-primary-fixed ring-2 ring-surface"
              src={ADMIN_AVATAR}
              alt="Healthcare administrator profile"
            />
          </div>
        </div>
      </div>
    </header>
  )
}
