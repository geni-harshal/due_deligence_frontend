// src/pages/login.jsx
import { useState } from "react";
import { useLogin, useGetCurrentUser } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { Redirect, useLocation } from "wouter";
import { ShieldAlert, ArrowRight } from "lucide-react";
import { Card, Button, Input, Label } from "@/components/ui-shared";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data: user, isLoading: isUserLoading } = useGetCurrentUser();

  const loginMut = useLogin();

  // If already logged in, redirect to home (which will redirect by role)
  if (isUserLoading) return null;
  if (user) return <Redirect to="/" />;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");
    loginMut.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          // Token is already stored by the useLogin hook
          // data.user is already in the query cache
          // Navigate based on role
          const role = data.user?.role?.toLowerCase() || "";

          if (role === "super_admin") {
            navigate("/admin");
          } else if (role.startsWith("client")) {
            navigate("/client");
          } else if (role.startsWith("operations")) {
            navigate("/operations");
          } else {
            navigate("/");
          }
        },
        onError: (err) => {
          const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Invalid email or password";
          setErrorMsg(msg);
        },
      }
    );
  };

  const fillDemo = (role) => {
    setPassword("password123");
    if (role === "admin") setEmail("super_admin@demo.com");
    if (role === "client") setEmail("client_admin@acme.com");
    if (role === "ops") setEmail("ops_user@demo.com");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      <img
        src={`${import.meta.env.BASE_URL}images/auth-bg.png`}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply"
        onError={(e) => (e.currentTarget.style.display = "none")}
      />

      <div className="relative z-10 w-full max-w-[420px] p-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-xl shadow-blue-600/20 mb-4">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900">
            DiligencePro
          </h1>
          <p className="mt-2 text-slate-500">
            Enterprise Due Diligence Platform
          </p>
        </div>

        <Card className="p-8 backdrop-blur-sm bg-white/90">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={loginMut.isPending}
            >
              Sign In <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">
              Demo Accounts
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => fillDemo("admin")}
                className="py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Admin
              </button>
              <button
                onClick={() => fillDemo("client")}
                className="py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Client
              </button>
              <button
                onClick={() => fillDemo("ops")}
                className="py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Ops
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Login;
