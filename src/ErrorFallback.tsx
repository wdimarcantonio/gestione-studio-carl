import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert"


interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
 

          </AlertDescription>
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-4">
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {error.message || "An unexpected error occurred"}

        </Alert>
        <Button 

          className="w-full"

          Try Again





