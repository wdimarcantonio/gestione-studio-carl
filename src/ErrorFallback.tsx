import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert"
import { Button } from "./components/ui/button"

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
 

          </AlertDescription>
        <B
          className="w-full"
          Try Again
        <Alert variant="destructive">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {error.message || "An unexpected error occurred"}
          </AlertDescription>
        </Alert>
        <Button 
          onClick={resetErrorBoundary}
          className="w-full"
        >
          Try Again
        </Button>

    </div>

}
