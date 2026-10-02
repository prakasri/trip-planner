"use client";

import { useRouter } from "next/navigation";
import { Grid, Column, Heading, Link } from "@carbon/react";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(username: string, password: string) {
    await login(username, password);
    router.push("/trips");
  }

  return (
    <Grid style={{ paddingTop: "3rem" }}>
      <Column lg={6} md={4} sm={4}>
        <Heading style={{ marginBottom: "1.5rem" }}>Log in</Heading>
        <AuthForm mode="login" onSubmit={handleSubmit} />
        <p style={{ marginTop: "1rem" }}>
          Need an account? <Link href="/signup">Sign up</Link>
        </p>
      </Column>
    </Grid>
  );
}
