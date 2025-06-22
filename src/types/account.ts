export interface IAccount {
    id: number;
    name: string;      // 고객사명
    code: string;      // 계정코드
    isActive: boolean; // 사용여부
    createdAt: string;
    updatedAt: string | null;
}

export interface IAccountCreateData {
    name: string;
    isActive: boolean;
}

export interface IAccountUpdateData {
    name?: string;
    isActive?: boolean;
}

export interface IAccountFormData {
    name: string;
    code: string;
    isActive: boolean;
} 