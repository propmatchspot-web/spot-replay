export default function ErrorPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 p-4 text-zinc-50">
            <div className="w-full max-w-md text-center">
                <h2 className="text-3xl font-bold tracking-tight text-red-500">
                    Something went wrong
                </h2>
                <p className="mt-4 text-zinc-400">
                    Sorry, we couldn't authenticate you. Please try again.
                </p>
                <a
                    href="/login"
                    className="mt-8 inline-block rounded-md bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 hover:bg-zinc-700"
                >
                    Back to Login
                </a>
            </div>
        </div>
    )
}
