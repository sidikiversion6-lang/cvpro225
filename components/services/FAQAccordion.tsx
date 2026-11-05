'use client'

import { useState } from 'react'
import type { FAQItem } from '@/content/services'

interface Props {
  items: FAQItem[]
  accentColor?: string
}

export default function FAQAccordion({ items, accentColor = '#0F7B5A' }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="mx-auto max-w-3xl divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
      {items.map((item, i) => {
        const isOpen = openIndex === i
        return (
          <div key={i}>
            <button
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-gray-50"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="font-heading text-sm font-semibold text-dark sm:text-base">
                {item.question}
              </span>
              <svg
                className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                style={{ color: accentColor }}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="px-6 pb-5 text-sm leading-relaxed text-gray-600">
                {item.reponse}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
