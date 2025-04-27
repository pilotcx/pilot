"use client";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  ArrowLeftIcon,
  BellIcon,
  CreditCardIcon,
  GlobeIcon,
  Settings2Icon,
  ShieldIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const settingsLinks = [
  {
    title: "General",
    href: "/me/settings/general",
    icon: <UserIcon className="h-4 w-4 mr-2" />,
  },
  {
    title: "Security",
    href: "/me/settings/security",
    icon: <ShieldIcon className="h-4 w-4 mr-2" />,
  },
  {
    title: "Notifications",
    href: "/me/settings/notifications",
    icon: <BellIcon className="h-4 w-4 mr-2" />,
  },
  {
    title: "Billing",
    href: "/me/settings/billing",
    icon: <CreditCardIcon className="h-4 w-4 mr-2" />,
  },
  {
    title: "API",
    href: "/me/settings/api",
    icon: <GlobeIcon className="h-4 w-4 mr-2" />,
  },
  {
    title: "Advanced",
    href: "/me/settings/advanced",
    icon: <Settings2Icon className="h-4 w-4 mr-2" />,
  },
];

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-1 mb-8">
          <div className="flex items-center gap-3">
            <ArrowLeftIcon
              onClick={() => router.push("/")}
              className="h-6 w-6 cursor-pointer"
            />
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-64 flex-shrink-0">
            <div className="hidden md:block space-y-1">
              {settingsLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm rounded-md",
                    pathname === link.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {link.icon}
                  {link.title}
                </Link>
              ))}
            </div>

            <div className="md:hidden">
              <Tabs defaultValue={pathname} className="w-full">
                <TabsList className="w-full justify-start overflow-x-auto">
                  {settingsLinks.map((link) => (
                    <TabsTrigger
                      key={link.href}
                      value={link.href}
                      className="flex items-center"
                      asChild
                    >
                      <Link href={link.href}>
                        {link.icon}
                        <span className="ml-1">{link.title}</span>
                      </Link>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
