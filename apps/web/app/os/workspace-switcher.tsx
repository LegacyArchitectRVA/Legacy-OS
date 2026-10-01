"use client";

import { useRouter, useSearchParams } from "next/navigation";

export type WorkspaceOption = { id: string; name: string };

type Props = {
  workspaces: WorkspaceOption[];
  selectedWorkspaceId: string | null;
};

export default function WorkspaceSwitcher({ workspaces, selectedWorkspaceId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (workspaces.length < 2) return null;

  function changeWorkspace(workspaceId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("workspace_id", workspaceId);
    router.push(`/os?${params.toString()}`);
  }

  return (
    <label className="flex min-w-0 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm">
      <span className="shrink-0 text-xs uppercase tracking-[0.18em] text-white/40">Workspace</span>
      <select
        aria-label="Select workspace"
        value={selectedWorkspaceId ?? workspaces[0]?.id ?? ""}
        onChange={(event) => changeWorkspace(event.target.value)}
        className="min-w-0 flex-1 bg-transparent font-medium text-white outline-none"
      >
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id} className="bg-[#101010] text-white">
            {workspace.name}
          </option>
        ))}
      </select>
    </label>
  );
}
