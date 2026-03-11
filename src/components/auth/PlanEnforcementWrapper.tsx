'use client'

import { useEffect, useState } from 'react'
import { PlanEnforcementModal } from './PlanEnforcementModal'

interface PlanEnforcementWrapperProps {
    isActive: boolean
    userPlanTier?: string
}

export function PlanEnforcementWrapper({ isActive, userPlanTier }: PlanEnforcementWrapperProps) {
    const [pendingPlan, setPendingPlan] = useState<string | null>(null)
    const [shouldShow, setShouldShow] = useState(false)

    useEffect(() => {
        // Parse cookie manually to get purchase_plan
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`
            const parts = value.split(`; ${name}=`)
            if (parts.length === 2) return parts.pop()?.split(';').shift()
        }

        const plan = getCookie('purchase_plan')

        if (plan) {
            setPendingPlan(plan)

            // Check if we need to enforce
            // Logic: pending plan is PAID (not free) AND user is NOT active
            const isPaidPlan = ['STARTER', 'GROWTH', 'ENTERPRISE'].includes(plan.toUpperCase())

            if (isPaidPlan && !isActive) {
                setShouldShow(true)
            }
        }
    }, [isActive])

    if (!shouldShow || !pendingPlan) return null

    return <PlanEnforcementModal plan={pendingPlan} />
}
