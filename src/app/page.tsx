import { TeamSelector } from "@/components/team-selector";
import { withAuthPage } from "@/lib/utils/withAuthPage";

export default async function HomePage() {
  // Ensure the user is authenticated
  await withAuthPage({
    redirectTo: '/login'
  });

  return (
    <main className="min-h-screen bg-background">
      <TeamSelector />
    </main>
  );
}
