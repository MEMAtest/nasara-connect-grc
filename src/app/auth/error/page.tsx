"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Configuration Error",
    description: "There is a problem with the server configuration. Please contact support if this persists.",
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You do not have permission to sign in.",
  },
  Verification: {
    title: "Verification Error",
    description: "The verification link may have expired or already been used.",
  },
  OAuthSignin: {
    title: "Sign In Error",
    description: "Error occurred while trying to sign in with the OAuth provider.",
  },
  OAuthCallback: {
    title: "Callback Error",
    description: "Error occurred during the OAuth callback process.",
  },
  OAuthCreateAccount: {
    title: "Account Creation Error",
    description: "Could not create OAuth account.",
  },
  EmailCreateAccount: {
    title: "Account Creation Error",
    description: "Could not create email account.",
  },
  Callback: {
    title: "Callback Error",
    description: "Error occurred during the authentication callback.",
  },
  OAuthAccountNotLinked: {
    title: "Account Not Linked",
    description: "This email is already associated with another account. Please sign in with the original provider.",
  },
  EmailSignin: {
    title: "Email Sign In Error",
    description: "The email could not be sent or the link is invalid.",
  },
  CredentialsSignin: {
    title: "Sign In Failed",
    description: "The credentials you provided are incorrect.",
  },
  SessionRequired: {
    title: "Session Required",
    description: "You must be signed in to access this page.",
  },
  Default: {
    title: "Authentication Error",
    description: "An error occurred during authentication. Please try again.",
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const errorInfo = errorMessages[error] || errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-900">{errorInfo.title}</CardTitle>
          <CardDescription className="text-slate-600">
            {errorInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/auth/login">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>
          {error !== "Default" && (
            <p className="text-xs text-center text-slate-400">
              Error code: {error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Loading...</p>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
