import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {GithubIcon, LinkedinIcon, Mail} from "lucide-react";
import {Metadata} from "next";
import Link from "next/link";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  avatar: string;
  social: {
    github?: string;
    linkedin?: string;
    email?: string;
  };
}

const teamMembers: TeamMember[] = [
  {
    name: "Anh Nhan Nguyen",
    role: "Full-stack Developer",
    bio: "An IT Enthusiast exploring the world of technology. Building scalable tech systems from scratch.",
    avatar: "https://avatars.githubusercontent.com/u/42785824?v=4",
    social: {
      github: "https://github.com/monokaijs",
      linkedin: "https://linkedin.com/in/monokaijs",
      email: "monokaijs@gmail.com"
    }
  },
  {
    name: "Nguyen Thi Quang Thang",
    role: "Full-stack Developer",
    bio: "Designer focused on creating beautiful, accessible, and user-friendly experiences.",
    avatar: "https://avatars.githubusercontent.com/u/101063068?v=4",
    social: {
      github: "https://github.com/thangdevalone",
      linkedin: "https://linkedin.com/in/thangdevalone",
      email: "thangnq@northstudio.vn"
    }
  },
];

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "About Pilot",
    description: "About Pilot project and the team behind it...",
  };
}

export default function AboutPage() {
  return (
    <div className="container max-w-4xl py-16 space-y-20 mx-auto">
      <section className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-medium tracking-tight">About Pilot</h1>
          <p className="text-xl text-muted-foreground">
            A team management and collaboration platform
          </p>
        </div>

        <div className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            Pilot was created with a simple mission: to make team collaboration seamless and efficient.
            We believe that when teams have the right tools to communicate, organize, and track their work,
            they can achieve incredible results.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our platform brings together task management, knowledge sharing, and team communication in one
            unified interface, eliminating the need to switch between multiple tools and ensuring everyone
            stays on the same page.
          </p>
        </div>
      </section>

      {/* Team Section */}
      <section className="space-y-8">
        <h2 className="text-2xl font-medium">Team</h2>

        <div className="grid gap-10">
          {teamMembers.map((member, index) => (
            <div key={index} className="flex gap-6 items-start">
              <Avatar className="h-16 w-16">
                <AvatarImage src={member.avatar} alt={member.name}/>
                <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="space-y-2">
                <div>
                  <h3 className="text-lg font-medium">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>

                <p className="text-muted-foreground">{member.bio}</p>

                <div className="flex gap-4 text-muted-foreground">
                  {member.social.github && (
                    <Link href={member.social.github} target="_blank" rel="noopener noreferrer"
                          className="hover:text-foreground transition-colors">
                      <GithubIcon className="h-4 w-4"/>
                      <span className="sr-only">GitHub</span>
                    </Link>
                  )}
                  {member.social.linkedin && (
                    <Link href={member.social.linkedin} target="_blank" rel="noopener noreferrer"
                          className="hover:text-foreground transition-colors">
                      <LinkedinIcon className="h-4 w-4"/>
                      <span className="sr-only">LinkedIn</span>
                    </Link>
                  )}
                  {member.social.email && (
                    <Link href={`mailto:${member.social.email}`} className="hover:text-foreground transition-colors">
                      <Mail className="h-4 w-4"/>
                      <span className="sr-only">Email</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
