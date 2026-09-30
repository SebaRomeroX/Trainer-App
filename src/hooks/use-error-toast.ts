import { useEffect, useRef } from "react"
import { toast } from "sonner"

/**
 * Shows an error toast once per error episode (no-error -> error transition),
 * so background poll failures don't spam toasts on every tick.
 */
export function useErrorToast(error: unknown, message: string) {
  const hadErrorRef = useRef(false)

  useEffect(() => {
    if (error && !hadErrorRef.current) {
      toast.error(message)
    }
    hadErrorRef.current = Boolean(error)
  }, [error, message])
}
