import axios from 'axios';
import { IProduct } from '../types/product';
import { IAccessCode, IApiResponse } from '../types/access';
import { IMappingRule } from '../types/mapping';
import { IExcelData } from '../types/excel';
import { IAccount, IAccountCreateData, IAccountUpdateData } from '../types/account';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request 인터셉터 추가
api.interceptors.request.use((config) => {
    const auth = localStorage.getItem('auth');
    if (auth) {
        const { accessToken } = JSON.parse(auth);
        if (accessToken) {
            config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        config.headers['X-Access-Code'] = JSON.parse(auth).accessCode;
    }
    return config;
});

// Response 인터셉터 추가
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// 엑셀 파일 업로드
export const uploadExcelFile = async (file: File): Promise<IApiResponse<IProduct[]>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<IApiResponse<IProduct[]>>('/excel/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// 매핑 룰 관련 API
export const mappingRuleApi = {
    getRules: async (category?: string): Promise<IApiResponse<IMappingRule[]>> => {
        const response = await api.get<IApiResponse<IMappingRule[]>>('/mapping-rules', {
            params: { category },
        });
        return response.data;
    },

    createRule: async (rule: Omit<IMappingRule, 'id'>): Promise<IApiResponse<IMappingRule>> => {
        const response = await api.post<IApiResponse<IMappingRule>>('/mapping-rules', rule);
        return response.data;
    },

    updateRule: async (id: number, rule: Partial<IMappingRule>): Promise<IApiResponse<IMappingRule>> => {
        const response = await api.put<IApiResponse<IMappingRule>>(`/mapping-rules/${id}`, rule);
        return response.data;
    },

    deleteRule: async (id: number): Promise<IApiResponse<void>> => {
        const response = await api.delete<IApiResponse<void>>(`/mapping-rules/${id}`);
        return response.data;
    },

    uploadExcel: async (formData: FormData): Promise<IApiResponse<IExcelData[]>> => {
        const response = await api.post('/excel/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    exportExcel: async (data: IExcelData[]): Promise<Blob> => {
        const response = await api.post('/excel/export', data, {
            responseType: 'blob',
        });
        return response.data;
    },

    downloadTemplate: async (): Promise<Blob> => {
        const response = await api.get('/excel/template', {
            responseType: 'blob',
        });
        return response.data;
    },

    mapHsCodes: async (data: IExcelData[]): Promise<IApiResponse<IExcelData[]>> => {
        const response = await api.post<IApiResponse<IExcelData[]>>('/excel/map-hs-codes', data);
        return response.data;
    },
};


// 접속 코드 관련 API
export const accessCodeApi = {
    validate: async (code: string): Promise<IApiResponse<{
        accessCode: string;
        role: string;
        access_token: string;
        token_type: string;
        expiresAt?: string;
    }>> => {
        const response = await api.post<IApiResponse<{
            accessCode: string;
            role: string;
            access_token: string;
            token_type: string;
            expiresAt?: string;
        }>>('/auth/validate', { code });
        return response.data;
    },

    deactivate: async (code: string): Promise<IApiResponse<boolean>> => {
        const response = await api.post<IApiResponse<boolean>>('/auth/deactivate', { code });
        return response.data;
    },

    getAll: async (): Promise<IApiResponse<IAccessCode[]>> => {
        const response = await api.get<IApiResponse<IAccessCode[]>>('/auth/codes');
        return response.data;
    },

    create: async (data: { code: string; role: string; expiresAt?: string }): Promise<IApiResponse<IAccessCode>> => {
        const response = await api.post<IApiResponse<IAccessCode>>('/auth/codes', data);
        return response.data;
    },
};

const convertAccount = (account: any): IAccount => ({
  id: account.id,
  name: account.name,
  code: account.code,
  isActive: account.isActive,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
});

export const accountApi = {
  getAccounts: async (): Promise<IAccount[]> => {
    const response = await api.get<any[]>('/accounts');
    return response.data.map(convertAccount);
  },

  getAccount: async (id: number): Promise<IAccount> => {
    const response = await api.get<any>(`/accounts/${id}`);
    return convertAccount(response.data);
  },

  createAccount: async (data: IAccountCreateData): Promise<IAccount> => {
    const response = await api.post<any>('/accounts', {
      name: data.name,
      isActive: data.isActive,
    });
    return convertAccount(response.data);
  },

  updateAccount: async (id: number, data: IAccountUpdateData): Promise<IAccount> => {
    const response = await api.put<any>(`/accounts/${id}`, {
      name: data.name,
      isActive: data.isActive,
    });
    return convertAccount(response.data);
  },

  deleteAccount: async (id: number): Promise<void> => {
    await api.delete(`/accounts/${id}`);
  },
};

export const templateApi = {
  async download() {
    const response = await fetch('/api/templates/download');
    if (!response.ok) {
      throw new Error('템플릿 다운로드에 실패했습니다.');
    }
    return response;
  },

  async upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/templates/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('템플릿 업로드에 실패했습니다.');
    }

    return response.json();
  },
};

export default api; 