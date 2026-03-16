import { WorkspaceRecord } from "../domain/models";

export interface SyncGateway {
  pushWorkspaceSnapshot(workspace: WorkspaceRecord): Promise<void>;
  pullWorkspaceSnapshot(workspaceId: string): Promise<WorkspaceRecord | null>;
  healthcheck(): Promise<"idle" | "ready" | "error">;
}

// This is the Expo Go-safe fallback. When the backend is ready on Railway, the
// implementation can switch to fetch-based sync without changing the UI layer.
export const noopSyncGateway: SyncGateway = {
  pushWorkspaceSnapshot: async () => {},
  pullWorkspaceSnapshot: async () => null,
  healthcheck: async () => "idle",
};
