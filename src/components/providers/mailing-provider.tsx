"use client";
import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {EmailAddress} from "@/lib/types/models/email-address";
import {Email, EmailConversation} from "@/lib/types/models/email";
import useApi from "@/hooks/use-api";
import apiService from "@/lib/services/api";
import {useTeam} from "@/components/providers/team-provider";

interface MailingContextType {
  addresses: EmailAddress[];
  conversations?: {
    conversation: EmailConversation,
    email: Email
  }[];
  activeAddress?: EmailAddress;
  setActiveAddress?: (address: EmailAddress) => void;
}

const MailingContext = createContext<MailingContextType>({
  addresses: [],
  conversations: [],
});

export const useMailing = () => useContext(MailingContext);

export default function MailingProvider({children, ...props}: MailingContextType & { children: ReactNode }) {
  const {team, membership} = useTeam();
  const [activeAddress, setActiveAddress] = useState<EmailAddress | undefined>(props.addresses[0]);

  const [getEmailConversations, {data: conversationsWithLatestEmail}] = useApi(apiService.getConversationsWithLatestEmail);

  useEffect(() => {
    if (!activeAddress?.fullAddress) return;
    getEmailConversations(team._id as string, membership._id as string, {
      page: 1,
      limit: 20,
      emailAddress: activeAddress?.fullAddress
    }).then(() => {

    });
  }, [activeAddress]);

  return <MailingContext.Provider
    value={{
      ...props,
      activeAddress,
      setActiveAddress,
      conversations: conversationsWithLatestEmail ?? [],
    }}
  >
    {children}
  </MailingContext.Provider>
}
