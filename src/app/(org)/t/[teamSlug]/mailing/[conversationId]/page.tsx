import {Button} from "@/components/ui/button";
import {ArchiveIcon, ArchiveXIcon, EyeOffIcon, ForwardIcon, PrinterIcon, Trash2Icon} from "lucide-react";
import {emailService} from "@/lib/services/email";
import {notFound} from "next/navigation";
import EmailSeries from "@/app/(org)/t/[teamSlug]/mailing/[conversationId]/components/EmailSeries";

interface EmailConversationPageProps {
  params: Promise<{
    conversationId: string;
  }>
}

export default async function EmailConversationPage({params}: EmailConversationPageProps) {
  const {conversationId} = await params;
  const conversation = await emailService.getConversationById(conversationId);
  if (!conversation) return notFound();
  return <div className={'w-full h-full flex flex-col'}>
    <div className={'flex flex-row p-2 border-b justify-between'}>
      <div className={'flex flex-row gap-2'}>
        <Button className={'w-9 h-9'} variant={'ghost'}>
          <ArchiveIcon/>
        </Button>
        <Button className={'w-9 h-9'} variant={'ghost'}>
          <ArchiveXIcon/>
        </Button>
        <Button className={'w-9 h-9'} variant={'ghost'}>
          <Trash2Icon/>
        </Button>
        <Button className={'w-9 h-9'} variant={'ghost'}>
          <EyeOffIcon/>
        </Button>
      </div>
      <div className={'flex flex-row gap-2'}>
        <Button className={'w-9 h-9'} variant={'ghost'}>
          <PrinterIcon/>
        </Button>
        <Button className={'w-9 h-9'} variant={'ghost'}>
          <ForwardIcon/>
        </Button>
      </div>
    </div>
    <div className={''}>
      <div className={'p-4 text-lg font-medium'}>
        {conversation.subject ?? 'Untitled'}
      </div>
      <EmailSeries/>
    </div>
  </div>
}
