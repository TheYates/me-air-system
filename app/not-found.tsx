import Link from 'next/link'

export default function NotFound() {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-950">
          <div className="mx-auto max-w-md space-y-4 p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              404 - Page Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              The page you are looking for does not exist.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
