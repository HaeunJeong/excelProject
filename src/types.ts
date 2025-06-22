export interface IAccount {
  id: number;
  name: string;
  code: string;
  isActive: boolean;
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