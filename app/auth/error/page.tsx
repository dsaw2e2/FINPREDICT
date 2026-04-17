import Link from "next/link"
import { TrendingUp, AlertCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">Authentication Error</h1>
          <p className="text-muted-foreground leading-relaxed">
            Something went wrong during authentication. This could be due to an expired link or invalid credentials.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild className="gap-2">
            <Link href="/auth/login">
              Try signing in again
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <TrendingUp className="w-4 h-4" />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
