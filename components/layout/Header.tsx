'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const SERVICES = [
  {
    emoji: '📄',
    nom: 'CV Pro ATS',
    href: '/services/cv-pro',
    description: 'CV optimisé pour les recruteurs',
  },
  {
    emoji: '💼',
    nom: 'JobAssist',
    href: '/services/job-assist',
    description: 'Aide à la candidature en ligne',
  },
]

const NAV_LINKS = [
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'Blog', href: '/blog' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Contact', href: '/contact' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 10)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024 && mobileOpen) {
        setMobileOpen(false)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [mobileOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMegaOpen(false)
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const closeMobile = useCallback(() => {
    setMobileOpen(false)
    setMobileServicesOpen(false)
  }, [])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 bg-white transition-all duration-300 ${
          scrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="gp-container flex h-[72px] items-center justify-between gap-6">

          {/* Logo */}
          <Link
            href="/"
            className="flex-shrink-0"
            onClick={closeMobile}
          >
            <Image
              src="/cvpro225.png"
              alt="CVPro225"
              width={1073}
              height={477}
              className="h-14 w-auto"
              priority
            />
          </Link>

          {/* Nav desktop */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">

            {/* Accueil */}
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-[0.9375rem] font-medium text-dark transition-colors hover:bg-primary-50 hover:text-primary"
            >
              Accueil
            </Link>

            {/* CV Checker (mis en évidence) */}
            <Link
              href="/outils/cv-check"
              className="rounded-lg px-3 py-2 text-[0.9375rem] font-semibold text-primary transition-colors hover:bg-primary-50"
            >
              🆕 CV Checker
            </Link>

            {/* Mega-menu Nos Services */}
            <div
              className="relative"
              onMouseEnter={() => setMegaOpen(true)}
              onMouseLeave={() => setMegaOpen(false)}
            >
              <button
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-[0.9375rem] font-medium text-dark transition-colors hover:bg-primary-50 hover:text-primary"
                aria-expanded={megaOpen}
                aria-haspopup="true"
                onClick={() => setMegaOpen(!megaOpen)}
              >
                Nos Services
                <svg
                  className={`h-3 w-3 transition-transform duration-200 ${megaOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 12 12"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M6 8.5L1 3.5h10L6 8.5z" />
                </svg>
              </button>

              {/* Dropdown mega-menu */}
              <div
                className={`absolute left-1/2 top-full pt-2 -translate-x-1/2 transition-all duration-200 ${
                  megaOpen
                    ? 'pointer-events-auto visible opacity-100 translate-y-0'
                    : 'pointer-events-none invisible opacity-0 -translate-y-2'
                }`}
              >
                <div className="w-[540px] rounded-2xl border border-gray-100 bg-white shadow-xl">
                  <div className="border-b border-gray-50 px-5 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Nos services
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-1 p-3">
                    {SERVICES.map((s) => (
                      <Link
                        key={s.href}
                        href={s.href}
                        className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-primary-50"
                        onClick={() => setMegaOpen(false)}
                      >
                        <span className="mt-0.5 text-2xl" aria-hidden="true">
                          {s.emoji}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-dark group-hover:text-primary">
                            {s.nom}
                          </p>
                          <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                            {s.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 rounded-b-2xl bg-gray-50 px-5 py-3 text-sm text-gray-500">
                    <span>Besoin d&apos;un devis ?</span>
                    <Link
                      href="/contact"
                      className="font-semibold text-primary hover:opacity-80"
                      onClick={() => setMegaOpen(false)}
                    >
                      Parler à un expert →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Liens simples */}
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-[0.9375rem] font-medium text-dark transition-colors hover:bg-primary-50 hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA desktop */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/login"
              className="gp-btn gp-btn-sm rounded-lg border-2 border-dark font-semibold text-dark transition-all hover:border-primary hover:text-primary"
            >
              Mon Espace
            </Link>
            <Link href="/commander" className="gp-btn gp-btn-primary gp-btn-sm rounded-lg font-semibold">
              Commander
            </Link>
          </div>

          {/* Hamburger mobile */}
          <button
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-lg lg:hidden"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span
              className={`block h-[2px] w-[22px] rounded-full bg-dark transition-all duration-300 ${mobileOpen ? 'translate-y-[7px] rotate-45' : ''}`}
            />
            <span
              className={`block h-[2px] w-[22px] rounded-full bg-dark transition-all duration-300 ${mobileOpen ? 'scale-x-0 opacity-0' : ''}`}
            />
            <span
              className={`block h-[2px] w-[22px] rounded-full bg-dark transition-all duration-300 ${mobileOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
            />
          </button>
        </div>
      </header>

      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          mobileOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
        onClick={closeMobile}
      />

      {/* Drawer mobile */}
      <div
        className={`fixed right-0 top-0 z-40 flex h-full w-[300px] max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="Menu de navigation"
        aria-hidden={!mobileOpen}
      >
        <div className="h-[72px] flex-shrink-0" />

        <nav className="flex-1 overflow-y-auto px-4 py-4" aria-label="Navigation mobile">
          <ul className="space-y-1">

            {/* CV Checker (mis en évidence) */}
            <li>
              <Link
                href="/outils/cv-check"
                className="block rounded-lg px-3 py-3 text-[0.9375rem] font-semibold text-primary transition-colors hover:bg-primary-50"
                onClick={closeMobile}
              >
                🆕 CV Checker
              </Link>
            </li>

            {/* Accordéon Services */}
            <li>
              <button
                className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-[0.9375rem] font-medium text-dark transition-colors hover:text-primary"
                aria-expanded={mobileServicesOpen}
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
              >
                Nos Services
                <svg
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    mobileServicesOpen ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 12 12"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M6 8.5L1 3.5h10L6 8.5z" />
                </svg>
              </button>

              <ul
                className={`overflow-hidden transition-all duration-300 ${
                  mobileServicesOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {SERVICES.map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      className="flex items-center gap-3 rounded-lg px-4 py-2.5 transition-colors hover:bg-primary-50"
                      onClick={closeMobile}
                    >
                      <span className="text-lg" aria-hidden="true">
                        {s.emoji}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-dark">{s.nom}</p>
                        <p className="text-xs text-gray-500">{s.description}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {/* Liens simples */}
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-lg px-3 py-3 text-[0.9375rem] font-medium text-dark transition-colors hover:text-primary"
                  onClick={closeMobile}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* CTA mobile */}
        <div className="flex flex-col gap-3 border-t border-gray-100 p-4">
          <Link
            href="/login"
            className="gp-btn gp-btn-outline w-full"
            onClick={closeMobile}
          >
            Mon Espace
          </Link>
          <Link
            href="/commander"
            className="gp-btn gp-btn-primary w-full"
            onClick={closeMobile}
          >
            Commander
          </Link>
        </div>
      </div>
    </>
  )
}
