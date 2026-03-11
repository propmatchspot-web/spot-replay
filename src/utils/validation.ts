
export const DISPOSABLE_DOMAINS = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'sharklasers.com',
    'yopmail.com',
    'getnada.com',
    'mailinator.com',
    'throwawaymail.com',
    'temp-mail.org',
    'fake-mail.com'
]

export function validatePassword(password: string): { isValid: boolean; error?: string } {
    if (password.length < 8) {
        return { isValid: false, error: 'Password must be at least 8 characters long' }
    }
    if (password.length > 16) {
        return { isValid: false, error: 'Password must be no more than 16 characters long' }
    }
    if (!/[A-Z]/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one uppercase letter' }
    }
    if (!/[a-z]/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one lowercase letter' }
    }
    if (!/\d/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one number' }
    }
    if (!/[@$!%*?&]/.test(password)) {
        return { isValid: false, error: 'Password must contain at least one special character (@$!%*?&)' }
    }
    return { isValid: true }
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
    const domain = email.split('@')[1]
    if (!domain) return { isValid: false, error: 'Invalid email address' }

    if (DISPOSABLE_DOMAINS.includes(domain.toLowerCase())) {
        return { isValid: false, error: 'Disposable/Temporary email addresses are not allowed' }
    }

    return { isValid: true }
}
