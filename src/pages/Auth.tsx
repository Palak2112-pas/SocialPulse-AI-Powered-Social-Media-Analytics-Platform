import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "signin" | "signup" | "forgot";

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();

  const mode = (searchParams.get("mode") as AuthMode) || "signin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const loading = false; // No real authentication

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === "signin" || mode === "signup") {
        // Store fake user in localStorage
        localStorage.setItem(
          "demoUser",
          JSON.stringify({
            email,
            fullName: fullName || "Demo User",
          })
        );

        toast({
          title: mode === "signin" ? "Welcome back!" : "Account created!",
          description: "Frontend demo login successful.",
        });

        navigate("/dashboard");
      } else if (mode === "forgot") {
        toast({
          title: "Reset link sent",
          description: "Demo mode: No real email sent.",
        });

        setSearchParams({ mode: "signin" });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong.",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {mode === "signin"
              ? "Sign In"
              : mode === "signup"
              ? "Create Account"
              : "Reset Password"}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <Input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            )}

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {mode !== "forgot" && (
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {mode === "signin"
                ? "Sign In"
                : mode === "signup"
                ? "Sign Up"
                : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-4 text-center space-y-2">
            {mode === "signin" && (
              <>
                <button
                  className="text-sm underline"
                  onClick={() => setSearchParams({ mode: "signup" })}
                >
                  Don't have an account? Sign up
                </button>
                <br />
                <button
                  className="text-sm underline"
                  onClick={() => setSearchParams({ mode: "forgot" })}
                >
                  Forgot password?
                </button>
              </>
            )}

            {mode === "signup" && (
              <button
                className="text-sm underline"
                onClick={() => setSearchParams({ mode: "signin" })}
              >
                Already have an account? Sign in
              </button>
            )}

            {mode === "forgot" && (
              <button
                className="text-sm underline"
                onClick={() => setSearchParams({ mode: "signin" })}
              >
                Back to Sign in
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
