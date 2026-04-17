import Link from "next/link"
import { TrendingUp, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Mail className="w-8 h-8 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
          <p className="text-muted-foreground leading-relaxed">
            We&apos;ve sent you a confirmation link. Click the link in your email to activate your account and start using FinPredict.
          </p>
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <Link href="/auth/sign-up" className="text-primary hover:underline">
              try again
            </Link>
          </p>
        </div>

        <div className="pt-4">
          <Button asChild variant="outline" className="gap-2">
            <Link href="/">
              <TrendingUp className="w-4 h-4" />
              Back to FinPredict
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
