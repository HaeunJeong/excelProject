import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { accessCodeApi } from '../services/api';

interface AccessCode {
  id: number;
  code: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

const AccessCodeManager: React.FC = () => {
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [open, setOpen] = useState(false);
  const [newCode, setNewCode] = useState({
    code: '',
    role: 'user',
    expiresAt: ''
  });
  const [loading, setLoading] = useState(false);

  const loadAccessCodes = async () => {
    try {
      setLoading(true);
      const response = await accessCodeApi.getAll();
      setAccessCodes(response.success && response.data ? response.data : []);
    } catch (error) {
      console.error('접근 코드 로딩 실패:', error);
      setAccessCodes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccessCodes();
  }, []);

  const handleCreateCode = async () => {
    try {
      const response = await accessCodeApi.create({
        code: newCode.code,
        role: newCode.role,
        expiresAt: newCode.expiresAt || undefined
      });
      
      if (response.success && response.data) {
        setAccessCodes([...accessCodes, response.data]);
        setOpen(false);
        setNewCode({ code: '', role: 'user', expiresAt: '' });
      }
    } catch (error) {
      console.error('접근 코드 생성 실패:', error);
    }
  };

  const handleDeactivateCode = async (code: string) => {
    try {
      const response = await accessCodeApi.deactivate(code);
      if (response.success) {
        loadAccessCodes();
      }
    } catch (error) {
      console.error('접근 코드 비활성화 실패:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">계정 코드 관리</Typography>
        <Box>
          <Button
            startIcon={<RefreshIcon />}
            onClick={loadAccessCodes}
            sx={{ mr: 1 }}
          >
            새로고침
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            새 코드 생성
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>접근 코드</TableCell>
              <TableCell>권한</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>생성일</TableCell>
              <TableCell>만료일</TableCell>
              <TableCell>작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accessCodes.map((code) => (
              <TableRow key={code.id}>
                <TableCell>
                  <Typography variant="body2">
                    {code.code}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        height: '24px',
                        padding: '0 12px',
                        fontSize: '0.8125rem',
                        borderRadius: '16px',
                        backgroundColor: code.role === 'admin' ? '#e0e0ff' : '#f5f5f5',
                        color: code.role === 'admin' ? '#5c5cff' : '#757575',
                        border: '1px solid',
                        borderColor: code.role === 'admin' ? '#c5c5ff' : '#e0e0e0',
                      }}
                    >
                      {code.role === 'admin' ? '관리자' : '일반 사용자'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography
                      component="span"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        height: '24px',
                        padding: '0 12px',
                        fontSize: '0.8125rem',
                        borderRadius: '16px',
                        backgroundColor: code.isActive ? '#e8f5e9' : '#ffebee',
                        color: code.isActive ? '#2e7d32' : '#d32f2f',
                        border: '1px solid',
                        borderColor: code.isActive ? '#c8e6c9' : '#ffcdd2',
                      }}
                    >
                      {code.isActive ? '활성' : '비활성'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(code.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {code.expiresAt ? new Date(code.expiresAt).toLocaleDateString() : '무기한'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <IconButton
                    color="error"
                    onClick={() => handleDeactivateCode(code.code)}
                    disabled={!code.isActive}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>새 접근 코드 생성</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="접근 코드"
            fullWidth
            value={newCode.code}
            onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
          />
          <TextField
            select
            margin="dense"
            label="권한"
            fullWidth
            value={newCode.role}
            onChange={(e) => setNewCode({ ...newCode, role: e.target.value })}
            SelectProps={{
              native: true,
            }}
          >
            <option value="user">일반 사용자</option>
            <option value="admin">관리자</option>
          </TextField>
          <TextField
            margin="dense"
            label="만료일 (선택사항)"
            type="date"
            fullWidth
            value={newCode.expiresAt}
            onChange={(e) => setNewCode({ ...newCode, expiresAt: e.target.value })}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button onClick={handleCreateCode} variant="contained">
            생성
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccessCodeManager; 