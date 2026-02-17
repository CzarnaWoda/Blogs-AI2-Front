export interface SectionDto {
  id: number;
  title: string;
  description: string;
  views: number;
  createdAt: string;
  type: string;
  creatorName: string;
  creatorEmail: string;
}

export interface CreateSectionRequest {
  title: string;
  description: string;
  type: string;
}

export interface UpdateSectionRequest {
  id: number;
  title: string;
  description: string;
  type: string;
}
