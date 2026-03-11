'use client'

import { Bell, ChevronDown, Plus, Check, Menu } from 'lucide-react'
import { useAccount } from '@/context/AccountContext'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AccountWizard } from '@/components/accounts/AccountWizard'
import { MobileSidebar } from '@/components/layout/MobileSidebar'

export function Topbar() {
    const { accounts, selectedAccount, switchAccount } = useAccount()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [showWizard, setShowWizard] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const router = useRouter()

    return (
        <>
            <div className="flex h-16 shrink-0 items-center gap-x-4 border-b border-zinc-800 bg-zinc-950 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
                <button
                    type="button"
                    className="-m-2.5 p-2.5 text-zinc-400 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(true)}
                >
                    <span className="sr-only">Open sidebar</span>
                    <Menu className="h-6 w-6" aria-hidden="true" />
                </button>

                <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                    <div className="flex flex-1 items-center">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol role="list" className="flex items-center space-x-4">
                                <li>
                                    <div className="flex">
                                        <a
                                            href="#"
                                            className="text-sm font-medium text-zinc-400 hover:text-zinc-200"
                                        >
                                            Home
                                        </a>
                                    </div>
                                </li>
                                <li>
                                    <div className="flex items-center">
                                        <span className="mx-4 h-5 w-px bg-zinc-700" aria-hidden="true" />
                                        <a
                                            href="#"
                                            className="text-sm font-medium text-zinc-400 hover:text-zinc-200"
                                        >
                                            Dashboard
                                        </a>
                                    </div>
                                </li>
                            </ol>
                        </nav>
                    </div>
                    <div className="flex items-center gap-x-4 lg:gap-x-6">
                        <button
                            type="button"
                            className="-m-2.5 p-2.5 text-zinc-400 hover:text-zinc-200"
                        >
                            <span className="sr-only">View notifications</span>
                            <Bell className="h-6 w-6" aria-hidden="true" />
                        </button>
                        <div
                            className="hidden lg:block lg:h-6 lg:w-px lg:bg-zinc-700"
                            aria-hidden="true"
                        />
                        <div className="relative">
                            <button
                                type="button"
                                className="-m-1.5 flex items-center p-1.5"
                                id="user-menu-button"
                                aria-expanded={isDropdownOpen}
                                aria-haspopup="true"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <span className="sr-only">Open user menu</span>
                                <span className="flex items-center">
                                    <span
                                        className="ml-4 text-sm font-semibold leading-6 text-zinc-100 hidden sm:block"
                                        aria-hidden="true"
                                    >
                                        {selectedAccount?.name || 'Select Account'}
                                    </span>
                                    {/* Show simplified view on mobile */}
                                    <span
                                        className="ml-2 text-sm font-semibold leading-6 text-zinc-100 sm:hidden"
                                        aria-hidden="true"
                                    >
                                        Account
                                    </span>
                                    <ChevronDown
                                        className={`ml-2 h-5 w-5 text-zinc-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                        aria-hidden="true"
                                    />
                                </span>
                            </button>

                            {/* Account Dropdown */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 z-50 mt-2.5 w-64 origin-top-right rounded-md bg-zinc-900 py-2 shadow-lg ring-1 ring-zinc-800 focus:outline-none">
                                    <div className="px-3 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                                        Switch Account
                                    </div>
                                    {accounts.map((account) => (
                                        <button
                                            key={account.id}
                                            onClick={() => {
                                                switchAccount(account.id)
                                                setIsDropdownOpen(false)
                                            }}
                                            className="flex w-full items-center justify-between px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white"
                                        >
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">{account.name}</span>
                                                <span className="text-xs text-zinc-500">{account.type}</span>
                                            </div>
                                            {selectedAccount?.id === account.id && (
                                                <Check className="h-4 w-4 text-[#F7AE11]" />
                                            )}
                                        </button>
                                    ))}
                                    <div className="my-1 h-px bg-zinc-800" />
                                    <button
                                        onClick={() => {
                                            setShowWizard(true)
                                            setIsDropdownOpen(false)
                                        }}
                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[#F7AE11] hover:bg-zinc-800 hover:text-amber-400 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add New Account
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Overlay to close dropdown */}
                {isDropdownOpen && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                    />
                )}
            </div>

            {/* Mobile Sidebar */}
            <MobileSidebar
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
            />

            {/* Account Wizard Modal */}
            {showWizard && (
                <AccountWizard
                    onComplete={() => {
                        setShowWizard(false)
                        window.location.reload()
                    }}
                    onSkip={() => setShowWizard(false)}
                />
            )}
        </>
    )
}
