import type { ArtifactStatus, ArtifactType } from "@prisma/client";

export interface CreateArtifactDto {
  title: string;
  type: ArtifactType;
  description?: string;
  status: ArtifactStatus;
}

export interface UpdateArtifactDto {
  title?: string;
  description?: string;
  status?: ArtifactStatus;
}