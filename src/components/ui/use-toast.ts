// src/components/ui/use-toast.ts
import { Toast } from "@/components/ui/toast"
import React from "react"

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  function toast(props: ToastProps) {
    setToasts((currentToasts) => [...currentToasts, { ...props, id: Math.random().toString() }])
  }

  return { toast, toasts, setToasts }
}