export type CommentUserRole = 'customer' | 'admin';

export interface Comment {
    commentId: string;
    userId: string;
    userRole: CommentUserRole;
    message: string;
    parentCommentId?: string; // For replies
    createdAt: Date;
}
