'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="mx-auto max-w-md space-y-4 p-8 text-center">
            <h2 className="text-2xl font-bold">Something went wrong!</h2>
            <p>An unexpected error occurred.</p>
            <button
              onClick={reset}
              className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
