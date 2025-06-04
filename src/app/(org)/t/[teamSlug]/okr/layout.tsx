import {ReactNode} from "react";

export default function OKRLayout({children}: {children: ReactNode}) {
  return <div className={'flex flex-1 px-8'}>
    {children}
  </div>
}
