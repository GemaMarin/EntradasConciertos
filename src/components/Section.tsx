export function Section({
  title,
  action,
  children,
  className = "",
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`mt-9 ${className}`}>
      <div className="mb-3.5 flex items-end justify-between px-5">
        <h2 className="font-[family-name:var(--font-display)] text-[1.35rem] font-bold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function PageTitle({ eyebrow, title, right }: { eyebrow?: string; title: string; right?: React.ReactNode }) {
  return (
    <header className="flex items-end justify-between px-5 pt-[calc(var(--safe-top)+1.5rem)]">
      <div>
        {eyebrow && <p className="mb-1 text-[13px] font-medium text-muted">{eyebrow}</p>}
        <h1 className="font-[family-name:var(--font-display)] text-[2.15rem] leading-none font-extrabold tracking-tight">
          {title}
        </h1>
      </div>
      {right}
    </header>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mx-5 flex flex-col items-center rounded-3xl border border-dashed border-line px-6 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2 text-muted">{icon}</div>
      <p className="font-semibold">{title}</p>
      <p className="mt-1 max-w-[18rem] text-sm text-muted">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
