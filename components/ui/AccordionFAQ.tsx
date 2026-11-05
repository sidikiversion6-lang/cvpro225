'use client'

import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
}

interface Props {
  items: FAQItem[]
}

export default function AccordionFAQ({ items }: Props) {
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
              <span
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all duration-200 ${
                  isOpen
                    ? 'rotate-45 bg-primary text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                +
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <p className="px-6 pb-5 text-sm leading-relaxed text-gray-600">
                {item.answer}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
