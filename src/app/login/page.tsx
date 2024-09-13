"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface LoginResponse {
  message: string;
}

const loginUser = async (password: string): Promise<LoginResponse> => {
  const response = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    throw new Error("Invalid password");
  }

  return response.json();
};

const LoginPage: React.FC = () => {
  const [password, setPassword] = useState<string>("");
  const router = useRouter();

  const loginMutation = useMutation<LoginResponse, Error, string>({
    mutationFn: loginUser,
    onSuccess: () => {
      router.push("/");
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    loginMutation.mutate(password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-800">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-8 space-y-4 bg-zinc-700 rounded-lg shadow-xl"
      >
        <h2 className="text-2xl font-bold text-center text-white">Login</h2>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-zinc-600 text-white border-zinc-500"
          placeholder="Enter password"
          required
        />
        {loginMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{loginMutation.error.message}</AlertDescription>
          </Alert>
        )}
        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Logging in..." : "Login"}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
