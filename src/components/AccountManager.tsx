import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { IAccount, IAccountCreateData, IAccountUpdateData } from '../types';
import { accountApi } from '../services/api';

const initialFormData: IAccountCreateData = {
  name: '',
  isActive: true,
};

const AccountManager: React.FC = () => {
  const [accounts, setAccounts] = useState<IAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<IAccountCreateData>(initialFormData);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountApi.getAccounts();
      setAccounts(data);
    } catch (error) {
      setError('계정 목록을 불러오는데 실패했습니다.');
      console.error('계정 목록 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleOpenDialog = (account?: IAccount) => {
    if (account) {
      setFormData({
        name: account.name,
        isActive: account.isActive,
      });
      setEditingId(account.id);
    } else {
      setFormData(initialFormData);
      setEditingId(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormData);
    setEditingId(null);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (editingId) {
        await accountApi.updateAccount(editingId, formData);
        setSuccess('계정이 수정되었습니다.');
      } else {
        await accountApi.createAccount(formData);
        setSuccess('새 계정이 생성되었습니다.');
      }
      
      handleCloseDialog();
      loadAccounts();
    } catch (error) {
      setError('계정 저장에 실패했습니다.');
      console.error('계정 저장 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('정말 이 계정을 삭제하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await accountApi.deleteAccount(id);
      setSuccess('계정이 삭제되었습니다.');
      loadAccounts();
    } catch (error) {
      setError('계정 삭제에 실패했습니다.');
      console.error('계정 삭제 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess('코드가 클립보드에 복사되었습니다.');
    } catch (err) {
      setError('코드 복사에 실패했습니다.');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">계정 코드 관리</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          새 계정 추가
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
        </Box>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>고객사명</TableCell>
              <TableCell>계정코드</TableCell>
              <TableCell>상태</TableCell>
              <TableCell>생성일</TableCell>
              <TableCell width={120} align="center">관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell>{account.name}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={account.code}
                      color="primary"
                      variant="outlined"
                      size="small"
                      onClick={() => handleCopyCode(account.code)}
                      clickable
                      icon={<ContentCopyIcon />}
                      sx={{ cursor: 'pointer' }}
                    />
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
                        backgroundColor: account.isActive ? '#e8f5e9' : '#f5f5f5',
                        color: account.isActive ? '#2e7d32' : '#757575',
                        border: '1px solid',
                        borderColor: account.isActive ? '#c8e6c9' : '#e0e0e0',
                      }}
                    >
                      {account.isActive ? '활성화' : '비활성화'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  {new Date(account.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(account)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(account.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          {editingId ? '계정 수정' : '새 계정 추가'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, width: 400 }}>
            <TextField
              fullWidth
              label="고객사명"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="활성화"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingId ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(null)}
        message={copySuccess}
      />
    </Box>
  );
};

export default AccountManager; 