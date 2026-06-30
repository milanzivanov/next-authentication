"use client";

import Link from "next/link";

import { signup } from "../actions/auth-actions";
import { useActionState } from "react";

export default function AuthForm() {
  const [formState, formAction] = useActionState(signup, { errors: null });

  return (
    <form id="auth-form" action={formAction}>
      <div>
        <img src="/images/auth-icon.jpg" alt="A lock icon" />
      </div>
      <p>
        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" />
      </p>
      {formState?.errors && (
        <ul id="form-errors">
          {Object.keys(formState.errors).map((error) => {
            console.log("Rendering error:", error, formState.errors[error]);
            return <li key={error}>{formState.errors[error]}</li>;
          })}
        </ul>
      )}
      <p>
        <button type="submit">Create Account</button>
      </p>
      <p>
        <Link href="/">Login with existing account.</Link>
      </p>
    </form>
  );
}
