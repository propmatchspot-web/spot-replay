'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { OnboardingPricingDialog } from '@/components/upgrade/OnboardingPricingDialog'

export function AutoUpgradeTrigger() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [showPayment, setShowPayment] = useState(false)

    useEffect(() => {
        const intent = searchParams.get('intent')
        if (intent === 'upgrade') {
            setShowPayment(true)
        }
    }, [searchParams])

    return (
        <OnboardingPricingDialog
            open={showPayment}
            onOpenChange={(open) => {
                setShowPayment(open)
                if (!open) {
                    // Optional: Remove intent param
                    // router.replace('/', { scroll: false })
                }
            }}
        />
    )
}
