'use client'

import { useEffect } from 'react'
import { analytics } from '@/lib/analytics'

interface ClinicViewTrackerProps {
  clinicId: string
  region: string
}

export default function ClinicViewTracker({ clinicId, region }: ClinicViewTrackerProps) {
  useEffect(() => {
    analytics.clinicView(clinicId, region)
  }, [clinicId, region])

  return null
}
