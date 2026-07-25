export function Footer() {
  return (
    <footer className="mt-auto border-t border-outline-variant/30 bg-surface-container-low/50">
      <div className="mx-auto flex w-full max-w-container-max items-center justify-between px-margin-desktop py-6">
        <p className="font-label-sm text-label-sm text-secondary">
          © 2024 MedhaNet AI — Ethiopian Healthcare Intelligence Platform
        </p>
        <div className="flex gap-8">
          <a
            href="#"
            className="font-label-sm text-label-sm text-on-secondary-container transition-colors hover:text-primary"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="font-label-sm text-label-sm text-on-secondary-container transition-colors hover:text-primary"
          >
            Support
          </a>
          <a
            href="#"
            className="font-label-sm text-label-sm text-on-secondary-container transition-colors hover:text-primary"
          >
            System Status
          </a>
        </div>
      </div>
    </footer>
  )
}
