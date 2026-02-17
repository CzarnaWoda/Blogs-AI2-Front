export interface ArticleDto {
  id: number;
  title: string;
  content: string;
  views: number;
  likes: number;
  authorName: string;
  authorEmail: string;
  createdAt: string;
  disabled?: boolean;
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  sectionId: number;
  authorId: number;
}

export interface UpdateArticleRequest {
  id: number;
  title: string;
  content: string;
}

export interface DisableArticleRequest {
  id: number;
  disabled: boolean;
}
