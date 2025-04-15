import {SidebarProvider,} from "@/components/ui/sidebar"
import {MailSidebar} from "@/components/mail-sidebar";

export default function MailingPage() {
  return (
    <div className={'relative h-full flex flex-col'} style={{ height: '100%', overflow: 'hidden' }}>
      <MailSidebar/>
    </div>
  )
}
