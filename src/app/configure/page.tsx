import {systemConfigService} from "@/lib/services/system-config";
import {SystemConfigKey} from "@/lib/types/models/system-config";
import {dbService} from "@/lib/db/service";
import {Button} from "@/components/ui/button";
import {revalidatePath} from "next/cache";
import {Input} from "@/components/ui/input";
import {Metadata} from "next";

export async function generateMetadata(): Promise<Metadata> {
  const title = await systemConfigService.get<string>(SystemConfigKey.OrgName);

  return {
    title: title,
  }
}


export default async function ConfigurePage() {
  await dbService.connect();

  async function toggle(form: FormData) {
    'use server'
    await systemConfigService.set(SystemConfigKey.OrgName, form.get('orgName') as string);
    revalidatePath('/');
  }

  return <div>
    <form action={toggle}>
      <Input name={'orgName'}/>
      <Button type={'submit'}>
        Toggle
      </Button>
    </form>
  </div>
}
