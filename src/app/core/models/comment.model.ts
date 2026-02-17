export interface CommentDto {
  id: number;
  value: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  likes: number;
  blocked?: boolean;
}

export interface CreateCommentRequest {
  value: string;
  articleId: number;
}

export interface UpdateCommentRequest {
  id: number;
  value: string;
}

export interface BlockCommentRequest {
  id: number;
  blocked: boolean;
}
