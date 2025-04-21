export default function KanbanTaskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={"flex flex-1 px-8 overflow-hidden min-h-0 h-full pb-4"}>{children}</div>;
}
