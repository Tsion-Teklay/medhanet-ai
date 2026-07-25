const MAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBFnl6heXuP_eLtDvaRFV1WIIYRjIfB-qLziAMbfd6xW-ga-Be8LmxImXYi14-k8EvvK4aFcYXOcOJhpd1vXJAqmb5Pz56V4faLHjhmvsd2qIbuH0OrVkqd3DekaWKvM-qR65mOLdRGZJ_2Ok1EMhN2Whd-CiQO4Whe74anQKY6b2djRFooLvPeLP6iRyLiufmIWOIaW77O9GQIQ715E25VRV2DlmWIjYgO0PA30-3_3P5po3zVH3d851mCLY33Wx3rJNlDB5DLY84'

type Hotspot = {
  id: string
  top: string
  left: string
  label: string
  primary?: boolean
}

const hotspots: Hotspot[] = [
  {
    id: 'addis',
    top: '50%',
    left: '50%',
    label: 'Addis Ababa: 24.1k Active',
    primary: true,
  },
  { id: 'bishoftu', top: '60%', left: '65%', label: 'Bishoftu: 2.4k' },
  { id: 'bahir-dar', top: '35%', left: '40%', label: 'Bahir Dar: 1.8k' },
]

export function RegionalHotspots() {
  return (
    <div className="card-soft-shadow flex flex-col overflow-hidden rounded-3xl border border-outline-variant/30 bg-surface-container-lowest lg:col-span-2">
      <div className="flex items-center justify-between border-b border-outline-variant/20 p-6">
        <div>
          <h3 className="font-title-md text-title-md text-on-surface">Regional Hotspots</h3>
          <p className="text-label-sm text-secondary">Real-time user density across Ethiopia</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-label-sm font-bold text-primary">
            <span className="h-3 w-3 rounded-full bg-primary" /> High Density
          </span>
        </div>
      </div>

      <div className="relative min-h-[400px] flex-grow bg-surface">
        <div className="tilet-pattern pointer-events-none absolute inset-0 opacity-10" />
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="relative h-full w-full overflow-hidden rounded-2xl border border-outline-variant/10 bg-white">
            <img
              className="h-full w-full object-cover opacity-40 grayscale"
              src={MAP_IMAGE}
              alt="Map of Ethiopia showing regional user density"
            />

            {hotspots.map((spot) =>
              spot.primary ? (
                <div
                  key={spot.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ top: spot.top, left: spot.left }}
                >
                  <div className="relative">
                    <div className="absolute h-24 w-24 animate-ping rounded-full bg-primary/20" />
                    <div className="absolute h-12 w-12 animate-pulse rounded-full bg-primary/40" />
                    <div className="h-4 w-4 rounded-full bg-primary shadow-lg ring-4 ring-white" />
                    <div className="absolute -left-16 -top-12 whitespace-nowrap rounded-full bg-on-surface px-3 py-1 text-[10px] text-surface shadow-xl">
                      {spot.label}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={spot.id}
                  className="absolute"
                  style={{ top: spot.top, left: spot.left }}
                >
                  <div className="relative">
                    <div className="h-3 w-3 rounded-full bg-primary/60 ring-2 ring-white" />
                    <div className="absolute -left-12 -top-8 whitespace-nowrap rounded-full bg-on-surface/80 px-2 py-0.5 text-[10px] text-surface">
                      {spot.label}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
