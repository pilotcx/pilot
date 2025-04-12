import { OrganizationSetupForm } from "@/app/configure/components/OrganizationSetupForm";
import { dbService } from "@/lib/db/service";

export default async function ConfigurePage() {
  await dbService.connect();

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 p-4">
      <div className="w-full max-w-4xl">
        <OrganizationSetupForm />
      </div>
    </div>
  );
}
