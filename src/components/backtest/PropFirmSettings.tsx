import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'

export interface ChallengeRules {
    dailyDrawdown: number
    maxDrawdown: number
    profitTarget: number
    timeLimit: number
    minTradingDays: number
}

interface PropFirmSettingsProps {
    rules: ChallengeRules
    onChange: (rules: ChallengeRules) => void
}

const PRESETS = {
    'FTMO_100K': {
        dailyDrawdown: 5,
        maxDrawdown: 10,
        profitTarget: 10,
        timeLimit: 30,
        minTradingDays: 4
    },
    'MFF_PHASE1': {
        dailyDrawdown: 5,
        maxDrawdown: 12,
        profitTarget: 8,
        timeLimit: 30,
        minTradingDays: 5
    },
    'CUSTOM': {
        dailyDrawdown: 5,
        maxDrawdown: 10,
        profitTarget: 10,
        timeLimit: 0,
        minTradingDays: 0
    }
}

export function PropFirmSettings({ rules, onChange }: PropFirmSettingsProps) {
    const [preset, setPreset] = React.useState('CUSTOM')

    const handlePresetChange = (value: string) => {
        setPreset(value)
        if (value !== 'CUSTOM') {
            // @ts-ignore
            onChange(PRESETS[value])
        }
    }

    const handleChange = (field: keyof ChallengeRules, value: string) => {
        setPreset('CUSTOM')
        onChange({
            ...rules,
            [field]: parseFloat(value) || 0
        })
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Challenge Preset</Label>
                <Select value={preset} onValueChange={handlePresetChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a preset" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="CUSTOM">Custom Rules</SelectItem>
                        <SelectItem value="FTMO_100K">FTMO (Normal)</SelectItem>
                        <SelectItem value="MFF_PHASE1">MyForexFunds (Phase 1)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Daily Drawdown (%)</Label>
                    <div className="relative">
                        <Input
                            type="number"
                            value={rules.dailyDrawdown}
                            onChange={(e) => handleChange('dailyDrawdown', e.target.value)}
                            className="pr-8"
                        />
                        <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Max Drawdown (%)</Label>
                    <div className="relative">
                        <Input
                            type="number"
                            value={rules.maxDrawdown}
                            onChange={(e) => handleChange('maxDrawdown', e.target.value)}
                            className="pr-8"
                        />
                        <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Profit Target (%)</Label>
                    <div className="relative">
                        <Input
                            type="number"
                            value={rules.profitTarget}
                            onChange={(e) => handleChange('profitTarget', e.target.value)}
                            className="pr-8"
                        />
                        <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">%</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Time Limit (Days)</Label>
                    <Input
                        type="number"
                        value={rules.timeLimit}
                        onChange={(e) => handleChange('timeLimit', e.target.value)}
                        placeholder="0 for unlimited"
                    />
                </div>
            </div>

            <Card className="p-3 bg-muted/50 text-xs text-muted-foreground">
                <p>
                    <strong>Note:</strong> In Prop Firm mode, the session will automatically end with a "FAILED" status if any drawdown limit is breached.
                </p>
            </Card>
        </div>
    )
}
