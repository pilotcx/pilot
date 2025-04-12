import { CreateTeamForm } from "@/components/create-team-form";
import { withAuthPage } from "@/lib/utils/withAuthPage";

export default async function NewTeamPage() {
  // Ensure the user is authenticated
  await withAuthPage({
    redirectTo: '/login'
  });

  return (
    <main className="min-h-screen bg-background py-10">
      <div className="container">
        <CreateTeamForm />
      </div>
    </main>
  );
}
