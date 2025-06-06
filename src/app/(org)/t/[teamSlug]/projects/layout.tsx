import {ReactNode} from "react";

export default function ProjectsLayout({children}: {children: ReactNode}) {
  return <div className={'flex flex-1 px-8 py-4'}>
    {children}
  </div>
}
