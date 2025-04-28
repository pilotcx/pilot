import {Email, EmailType} from "@/lib/types/models/email";
import EmailIframe from "@/app/(org)/t/[teamSlug]/mailing/[conversationId]/components/EmailIframe";
import gravatar from "gravatar";
import dayjs from "dayjs";
import {parseEmailFrom} from "@/lib/utils/parseEmailFrom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {ChevronDownIcon} from "lucide-react";

export default function EmailDisplay({email}: { email: Email }) {
  const {name: senderName, email: senderEmail} = parseEmailFrom(email.from);
  let recipient = [email.recipient];
  if (email.direction === EmailType.Outgoing) recipient = email.to;

  return <div>
    <div className={'flex flex-row gap-4 px-4 mb-2'}>
      <div className={'h-10 w-10'}>
        <img
          src={gravatar.url(senderEmail!)}
          alt={senderName}
          className={'h-10 w-10 rounded-full'}
        />
      </div>
      <div className={'flex-1'}>
        <div className={'flex flex-row justify-between items-center'}>
          <div className={'flex flex-1 flex-row gap-2 items-center'}>
            <div className={'font-medium line-clamp-1'}>
              {senderName}
            </div>
            <div className={'text-muted-foreground text-xs line-clamp-1'}>
              {"<"}{senderEmail}{">"}
            </div>
          </div>
          <div className={'text-muted-foreground text-xs line-clamp-1'}>
            {dayjs(email.createdAt).format('MMM D, YYYY h:mm A')}
          </div>
        </div>
        <div className={'flex flex-row items-center'}>
          <div className={'text-muted-foreground text-xs'}>
            to {recipient.map(r => r.split('@')[0]).join(', ')}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <div className={'p-0.5 cursor-pointer'}>
                <ChevronDownIcon className={'size-3'}/>
              </div>
            </PopoverTrigger>
            <PopoverContent className={'text-xs w-full'}>
              <div className={'flex flex-row gap-2'}>
                <div className={'w-16 text-right text-muted-foreground'}>
                  From:
                </div>
                <div className={'flex-1 font-medium line-clamp-1'}>
                  {email.from}
                </div>
              </div>
              <div className={'flex flex-row gap-2'}>
                <div className={'w-16 text-right text-muted-foreground'}>
                  To:
                </div>
                <div className={'font-medium'}>
                  {recipient.join(', ')}
                </div>
              </div>
              <div className={'flex flex-row gap-2'}>
                <div className={'w-16 text-right text-muted-foreground'}>
                  Date:
                </div>
                <div className={'font-medium whitespace-nowrap'}>
                  {dayjs(email.createdAt).format('MMM D, YYYY h:mm A')}
                </div>
              </div>
              <div className={'flex flex-row gap-2'}>
                <div className={'w-16 text-right text-muted-foreground'}>
                  Subject:
                </div>
                <div className={'font-medium whitespace-nowrap'}>
                  {email.subject}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
    <div className={'pl-18 py-0.5'}>
      <EmailIframe html={email.html}/>
    </div>
  </div>
}
