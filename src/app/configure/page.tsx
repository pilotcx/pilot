import { OrganizationSetupForm } from "@/app/configure/components/OrganizationSetupForm";
import { dbService } from "@/lib/db/service";

export default async function ConfigurePage() {
  await dbService.connect();

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xl">
        <OrganizationSetupForm />
      </div>
    </div>
  );
}
