interface Step {
  icon: React.ReactNode
  titre: string
  description: string
}

export default function ServiceSteps({ steps, accentColor }: { steps: Step[]; accentColor: string }) {
  return (
    <div className={`grid gap-0 sm:grid-cols-2 ${steps.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
      {steps.map((s, i) => (
        <div
          key={i}
          className={`px-6 py-10 text-center ${
            i !== steps.length - 1 ? 'lg:border-r border-gray-200' : ''
          }`}
        >
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center" style={{ color: accentColor }}>
            {s.icon}
          </div>
          <h3 className="font-heading text-lg font-bold text-[#0F172A]">{s.titre}</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">{s.description}</p>
        </div>
      ))}
    </div>
  )
}
