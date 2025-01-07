import { redirect } from "next/navigation";
import { getSession } from "@auth0/nextjs-auth0/edge"; // or the "classic" version

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}