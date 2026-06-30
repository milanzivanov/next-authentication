import AuthForm from "@/components/auth-form";

export default async function Home({ searchParams }) {
  const test = await searchParams;
  console.log("Rendering Home page with searchParams:", test.mode);
  const formMode = (await searchParams)?.mode || "login";
  return <AuthForm mode={formMode} />;
}
