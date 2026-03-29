interface ErrorMessageProps {
  message?: string | null
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <p className="font-medium">Ocorreu um erro</p>
      {message && <p className="mt-1 text-red-600">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export function InlineError({ message }: { message?: string | null }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-600">{message}</p>
}
