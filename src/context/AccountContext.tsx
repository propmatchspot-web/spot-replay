'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type Account = {
    id: string
    name: string
    type: string
    balance: number
    currency: string
}

interface AccountContextType {
    accounts: Account[]
    selectedAccount: Account | null
    switchAccount: (accountId: string) => void
    isLoading: boolean
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export function AccountProvider({
    children,
    initialAccounts
}: {
    children: React.ReactNode
    initialAccounts: Account[]
}) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [accounts] = useState<Account[]>(initialAccounts)
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Initialize selected account from URL or default to first
        const accountIdFromUrl = searchParams.get('accountId')

        if (accountIdFromUrl) {
            const account = accounts.find(a => a.id === accountIdFromUrl)
            if (account) {
                setSelectedAccount(account)
            } else if (accounts.length > 0) {
                // Invalid ID in URL, default to first
                setSelectedAccount(accounts[0])
                router.replace(`/?accountId=${accounts[0].id}`)
            }
        } else if (accounts.length > 0) {
            // No ID in URL, default to first
            setSelectedAccount(accounts[0])
            // We don't force push URL here to keep it clean, but we could
        }

        setIsLoading(false)
    }, [accounts, searchParams, router])

    const switchAccount = (accountId: string) => {
        const account = accounts.find(a => a.id === accountId)
        if (account) {
            setSelectedAccount(account)
            // Update URL to persist selection
            const params = new URLSearchParams(searchParams.toString())
            params.set('accountId', accountId)
            router.push(`/?${params.toString()}`)
        }
    }

    return (
        <AccountContext.Provider value={{ accounts, selectedAccount, switchAccount, isLoading }}>
            {children}
        </AccountContext.Provider>
    )
}

export function useAccount() {
    const context = useContext(AccountContext)
    if (context === undefined) {
        throw new Error('useAccount must be used within an AccountProvider')
    }
    return context
}
