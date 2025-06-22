import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState } from '../types/auth';
import { accessCodeApi } from '../services/api';

interface AuthContextType extends AuthState {
    login: (code: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>(() => {
        // 로컬 스토리지에서 인증 정보 복원
        const savedAuth = localStorage.getItem('auth');
        if (savedAuth) {
            return JSON.parse(savedAuth);
        }
        return {
            isAuthenticated: false,
            accessCode: null,
            accessToken: null,
            role: null,
            error: null
        };
    });

    // 인증 상태가 변경될 때마다 로컬 스토리지에 저장
    useEffect(() => {
        if (authState.isAuthenticated) {
            localStorage.setItem('auth', JSON.stringify(authState));
        } else {
            localStorage.removeItem('auth');
        }
    }, [authState]);

    const login = async (code: string): Promise<boolean> => {
        try {
            const response = await accessCodeApi.validate(code);
            
            if (response.success && response.data) {
                const authData = {
                    isAuthenticated: true,
                    accessCode: response.data.accessCode,
                    accessToken: response.data.access_token,
                    role: response.data.role,
                    error: null
                };
                setAuthState(authData);
                localStorage.setItem('auth', JSON.stringify(authData));
                return true;
            }
            
            // 서버에서 success: false를 반환한 경우
            const errorData = {
                ...authState,  // 기존 상태 유지
                isAuthenticated: false,
                error: '유효하지 않은 접속코드입니다'
            };
            setAuthState(errorData);
            return false;
        } catch (error: any) {
            // 서버에서 에러를 반환한 경우 (401, 500 등)
            const errorMessage = error.response?.data?.detail?.message || '서버 오류가 발생했습니다';
            const errorData = {
                ...authState,  // 기존 상태 유지
                isAuthenticated: false,
                error: errorMessage
            };
            setAuthState(errorData);
            return false;
        }
    };

    const logout = () => {
        setAuthState({
            isAuthenticated: false,
            accessCode: null,
            accessToken: null,
            role: null,
            error: null
        });
        localStorage.removeItem('auth');
    };

    return (
        <AuthContext.Provider value={{ ...authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}; 