'use client'

import { useState, useMemo, useCallback } from 'react'
import type { DestinationVisa, DestinationConfig, VisaScoreResult } from '@/types/visa'
import { getDestinationConfig, calculateVisaScore } from '@/lib/visa-config'

export function useVisaSimulator() {
  const [destination, setDest] = useState<DestinationVisa | null>(null)
  const [checkedDocs, setCheckedDocs] = useState<string[]>([])

  const config: DestinationConfig | null = useMemo(
    () => (destination ? getDestinationConfig(destination) : null),
    [destination]
  )

  const result: VisaScoreResult | null = useMemo(
    () => (destination ? calculateVisaScore(destination, checkedDocs) : null),
    [destination, checkedDocs]
  )

  const setDestination = useCallback((dest: DestinationVisa) => {
    setDest(dest)
    setCheckedDocs([])
  }, [])

  const toggleDoc = useCallback((docId: string) => {
    setCheckedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    )
  }, [])

  const checkAll = useCallback(() => {
    if (config) setCheckedDocs(config.documents.map((d) => d.id))
  }, [config])

  const uncheckAll = useCallback(() => {
    setCheckedDocs([])
  }, [])

  const isChecked = useCallback(
    (docId: string) => checkedDocs.includes(docId),
    [checkedDocs]
  )

  return {
    destination, config, checkedDocs, result,
    setDestination, toggleDoc, checkAll, uncheckAll, isChecked,
  }
}
