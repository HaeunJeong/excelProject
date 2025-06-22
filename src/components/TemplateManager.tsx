import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  CloudDownload as DownloadIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const Input = styled('input')({
  display: 'none',
});

const TemplateManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/templates/download');
      if (!response.ok) {
        throw new Error('템플릿 다운로드에 실패했습니다.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess('템플릿이 다운로드되었습니다.');
    } catch (err) {
      setError('템플릿 다운로드 중 오류가 발생했습니다.');
      console.error('템플릿 다운로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;

    try {
      setLoading(true);
      setError(null);

      const file = event.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/templates/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('템플릿 업로드에 실패했습니다.');
      }

      setSuccess('템플릿이 성공적으로 업로드되었습니다.');
      event.target.value = ''; // 파일 선택 초기화
    } catch (err) {
      setError('템플릿 업로드 중 오류가 발생했습니다.');
      console.error('템플릿 업로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        업로드 양식 관리
      </Typography>

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

      <Paper sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            disabled={loading}
          >
            엑셀 템플릿 다운로드
          </Button>

          <label>
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleUpload}
              disabled={loading}
            />
            <Button
              variant="contained"
              component="span"
              startIcon={<UploadIcon />}
              disabled={loading}
            >
              엑셀 템플릿 업로드
            </Button>
          </label>
        </Box>
      </Paper>
    </Box>
  );
};

export default TemplateManager; 