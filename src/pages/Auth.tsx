import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Mail, Lock, User, Calendar, Briefcase, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import socialPulseLogo from "@/assets/socialpulse-logo.png";
import { z } from "zod";

const emailSchema = z.string().trim().email({ message: "Please enter a valid email address" });
const passwordSchema = z.string().min(6, { message: "Password must be at least 6 characters" });
const nameSchema = z.string().trim().min(2, { message: "Name must be at least 2 characters" });

type AuthMode = "signin" | "signup" | "forgot";

export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signIn, signUp, signOut, resetPassword, loading } = useAuth();
  const { toast } = useToast();
  
  const initialMode = (searchParams.get("mode") as AuthMode) || "signin";
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [profession, setProfession] = useState("");
  const [customProfession, setCustomProfession] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Clear any stale session when entering signup mode
  useEffect(() => {
    const clearSessionForSignup = async () => {
      if (mode === "signup") {
        // Sign out any existing session to prevent stale auth state
        await signOut();
        // Update URL to include signup mode
        setSearchParams({ mode: "signup" });
      }
    };
    clearSessionForSignup();
  }, [mode, signOut, setSearchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    if (mode !== "forgot") {
      try {
        passwordSchema.parse(password);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.password = e.errors[0].message;
        }
      }
    }

    if (mode === "signup") {
      try {
        nameSchema.parse(fullName);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.fullName = e.errors[0].message;
        }
      }
      
      if (!dateOfBirth) {
        newErrors.dateOfBirth = "Please select your date of birth";
      }
      
      if (!profession) {
        newErrors.profession = "Please select your profession";
      }
      
      if (profession === "other" && !customProfession.trim()) {
        newErrors.customProfession = "Please enter your profession";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            variant: "destructive",
            title: "Sign in failed",
            description: error.message === "Invalid login credentials" 
              ? "Invalid email or password. Please try again."
              : error.message,
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in.",
          });
          navigate("/dashboard");
        }
      } else if (mode === "signup") {
        const finalProfession = profession === "other" ? customProfession : profession;
        const { error } = await signUp(email, password, {
          full_name: fullName,
          date_of_birth: dateOfBirth,
          profession: finalProfession,
        });
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              variant: "destructive",
              title: "Account exists",
              description: "An account with this email already exists. Please sign in instead.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Sign up failed",
              description: error.message,
            });
          }
        } else {
          // Sign out immediately after signup to require explicit login
          await signOut();
          toast({
            title: "Account created successfully!",
            description: "Please sign in with your credentials.",
          });
          clearForm();
          // Remove signup mode from URL and switch to signin
          setSearchParams({});
          setMode("signin");
        }
      } else if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            variant: "destructive",
            title: "Reset failed",
            description: error.message,
          });
        } else {
          toast({
            title: "Reset email sent",
            description: "Please check your email for the password reset link.",
          });
          setMode("signin");
        }
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setDateOfBirth("");
    setProfession("");
    setCustomProfession("");
    setErrors({});
  };

  const switchMode = (newMode: AuthMode) => {
    clearForm();
    setMode(newMode);
    // Update URL params - clear for signin, set mode for signup/forgot
    if (newMode === "signin") {
      setSearchParams({});
    } else {
      setSearchParams({ mode: newMode });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12">
        <Link to="/" className="flex items-center gap-3">
          <img src={socialPulseLogo} alt="SocialPulse Logo" className="w-10 h-10 rounded-xl" />
          <span className="font-display text-xl font-bold text-foreground">SocialPulse</span>
        </Link>
      </nav>

      {/* Auth Form */}
      <div className="relative z-10 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="glass-card p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-secondary/50 border border-border/50">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {mode === "signin" && "Welcome Back"}
                  {mode === "signup" && "Join SocialPulse"}
                  {mode === "forgot" && "Reset Password"}
                </span>
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {mode === "signin" && "Sign In"}
                {mode === "signup" && "Create Account"}
                {mode === "forgot" && "Forgot Password"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {mode === "signin" && "Enter your credentials to access your dashboard"}
                {mode === "signup" && "Fill in your details to get started"}
                {mode === "forgot" && "Enter your email to receive a reset link"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sign Up Fields */}
              {mode === "signup" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {errors.dateOfBirth && <p className="text-sm text-destructive">{errors.dateOfBirth}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profession">Profession</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                      <Select value={profession} onValueChange={setProfession}>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select your profession" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="content_creator">Content Creator</SelectItem>
                          <SelectItem value="businessperson">Businessperson</SelectItem>
                          <SelectItem value="actor">Actor</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.profession && <p className="text-sm text-destructive">{errors.profession}</p>}
                  </div>

                  {profession === "other" && (
                    <div className="space-y-2">
                      <Label htmlFor="customProfession">Specify Profession</Label>
                      <Input
                        id="customProfession"
                        type="text"
                        placeholder="Enter your profession"
                        value={customProfession}
                        onChange={(e) => setCustomProfession(e.target.value)}
                      />
                      {errors.customProfession && <p className="text-sm text-destructive">{errors.customProfession}</p>}
                    </div>
                  )}
                </>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              {/* Password Field */}
              {mode !== "forgot" && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>
              )}

              {/* Forgot Password Link */}
              {mode === "signin" && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-primary to-violet hover:opacity-90 text-primary-foreground py-6"
              >
                {isSubmitting ? "Please wait..." : (
                  <>
                    {mode === "signin" && "Sign In"}
                    {mode === "signup" && "Create Account"}
                    {mode === "forgot" && "Send Reset Link"}
                  </>
                )}
              </Button>
            </form>

            {/* Mode Switch Links */}
            <div className="mt-6 space-y-3">
              {mode === "signin" && (
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    onClick={() => switchMode("signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              )}

              {mode === "signup" && (
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    onClick={() => switchMode("signin")}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </p>
              )}

              {mode === "forgot" && (
                <p className="text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <button
                    onClick={() => switchMode("signin")}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign In
                  </button>
                </p>
              )}

              {/* Back to Landing */}
              <Link
                to="/"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
