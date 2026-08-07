export type DocumentUpload = {
  name: string;
  type: string;
  workspaceId: string;
};

export function createUploadRecord(input: DocumentUpload) {
  return {
    ...input,
    status: "uploaded"
  };
}
