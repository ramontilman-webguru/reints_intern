"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (result?.error) {
        setError("Invalid username or password");
        console.error("Sign in error:", result.error);
        setIsLoading(false);
      } else if (result?.ok) {
        const callbackUrl =
          new URLSearchParams(window.location.search).get("callbackUrl") ||
          "/dashboard";
        router.push(callbackUrl);
      } else {
        setError("An unexpected error occurred. Please try again.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Sign in exception:", error);
      setError("An error occurred during sign in.");
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-background'>
      <Image
        src='/logo.svg'
        alt='Company Logo'
        width={250}
        height={60} // Maintain aspect ratio (approx 1103/284)
        className='mb-6' // Add some margin below the logo
        priority // Prioritize loading the logo
      />
      <Card className='w-full max-w-sm'>
        <CardHeader>
          <CardTitle className='text-2xl'>Login</CardTitle>
          <CardDescription>
            Vul je gebruikersnaam en wachtwoord in om je in te loggen op de
            Reints Office Dashboard.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className='grid gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='username'>Gebruikersnaam</Label>
              <Input
                id='username'
                type='text'
                placeholder='Gebruikersnaam'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='password'>Wachtwoord</Label>
              <Input
                id='password'
                type='password'
                placeholder='Wachtwoord'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && <p className='text-sm text-red-600'>{error}</p>}
          </CardContent>
          <CardFooter>
            <Button
              className='w-full bg-reints text-white hover:bg-reints/90 mt-4'
              type='submit'
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
