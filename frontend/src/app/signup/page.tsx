"use client";

import { useRouter } from "next/navigation";
import { Grid, Column, Heading, Link } from "@carbon/react";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();

  async function handleSubmit(username: string, password: string) {
    await signup(username, password);
    router.push("/trips");
  }

  return (
    <Grid style={{ paddingTop: "3rem" }}>
      <Column lg={6} md={4} sm={4}>
        <Heading style={{ marginBottom: "1.5rem" }}>Sign up</Heading>
        <AuthForm mode="signup" onSubmit={handleSubmit} />
        <p style={{ marginTop: "1rem" }}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </Column>
    </Grid>
  );
}
