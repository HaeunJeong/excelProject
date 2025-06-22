export interface IAccessCode {
    id: number;
    code: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    expiresAt?: string;
}

export interface IApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
} 