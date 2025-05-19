import { createContext, useContext } from 'react'
import { toast } from 'sonner'

// Create context
const ToastContext = createContext(null)

// Provider component
export const ToastProvider = ({ children }) => {
  // Toast utility functions
  const showToast = (message, options = {}) => {
    return toast(message, options)
  }

  const showSuccess = (message, options = {}) => {
    return toast.success(message, options)
  }

  const showError = (message, options = {}) => {
    return toast.error(message, options)
  }

  const showWarning = (message, options = {}) => {
    return toast.warning(message, options)
  }

  const showInfo = (message, options = {}) => {
    return toast.info(message, options)
  }

  const showPromise = (promise, options = {}) => {
    return toast.promise(promise, options)
  }

  const dismiss = (toastId) => {
    toast.dismiss(toastId)
  }

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showPromise,
        dismiss,
      }}
    >
      {children}
    </ToastContext.Provider>
  )
}

// Custom hook for using the toast context
export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === null) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
