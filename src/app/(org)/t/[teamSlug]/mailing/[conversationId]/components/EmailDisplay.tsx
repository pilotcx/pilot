import {Email} from "@/lib/types/models/email";
import EmailIframe from "@/app/(org)/t/[teamSlug]/mailing/[conversationId]/components/EmailIframe";
import gravatar from "gravatar";
import dayjs from "dayjs";
import {parseEmailFrom} from "@/lib/utils/parseEmailFrom";

export default function EmailDisplay({email}: { email: Email }) {
  const {name: senderName, email: senderEmail} = parseEmailFrom(email.from);

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
        <div className={'text-muted-foreground text-xs'}>
          to {email.recipient?.split('@')[0]}
        </div>
      </div>
    </div>
    <div className={'pl-18 py-0.5'}>
      <EmailIframe html={email.html}/>
    </div>
  </div>
}
