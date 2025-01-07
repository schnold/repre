import { redirect } from "next/navigation";
import { getSession } from "@auth0/nextjs-auth0/edge";

export default async function LandingPage() {
  const session = await getSession();
  if (session?.user) {
    // If a user is already logged in, skip landing page
    redirect("/dashboard");
  }

  // Otherwise show your marketing hero sections
  return (
    <div>
      <h1>Public Landing Page</h1>
      <p>Welcome! Please sign in or sign up.</p>
    </div>
  );
}
