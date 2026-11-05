export default function VisaGuineeBanner() {
  return (
    <section className="bg-gray-50 py-10">
      <div className="mx-auto w-full max-w-[1400px] px-6 sm:px-8">
        <a
          href="https://visaguinee.com"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-sm border border-gray-200 bg-white px-6 py-5 transition-all hover:border-primary hover:shadow-md"
        >
          <div className="flex items-start sm:items-center gap-4">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl" aria-hidden="true">
              ✈️
            </span>
            <div>
              <p className="font-heading text-base font-semibold text-[#0F172A]">
                Besoin d&apos;un service visa ?
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Découvrez notre plateforme dédiée pour vérifier votre dossier visa.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
            VisaGuinee.com
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </span>
        </a>
      </div>
    </section>
  )
}
