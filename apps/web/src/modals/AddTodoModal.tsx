import React from 'react'
import { Box, Modal, Typography, TextField, Button } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { ja } from 'date-fns/locale'

interface Props {
    open: boolean
    onClose: () => void
    newContent: string
    newTags: string
    newDueDate: Date | null
    setNewContent: (value: string) => void
    setNewTags: (value: string) => void
    setNewDueDate: (date: Date | null) => void
    handleAddTodo: () => void
    message: string
}

export const AddTodoModal: React.FC<Props> = ({
    open,
    onClose,
    newContent,
    newTags,
    newDueDate,
    setNewContent,
    setNewTags,
    setNewDueDate,
    handleAddTodo,
    message,
}) => {
    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    bgcolor: 'background.paper',
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 24,
                    width: 320,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                <Typography variant="h6">新しい記録を追加</Typography>

                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                    <DatePicker
                        label="時刻"
                        value={newDueDate}
                        onChange={setNewDueDate}
                        slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
                    />
                </LocalizationProvider>

                <TextField
                    label="薬を選択"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    fullWidth
                    margin="normal"
                />

                <TextField
                    label="錠数を入力"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    fullWidth
                    margin="normal"
                />

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button variant="contained" onClick={handleAddTodo} fullWidth>
                        追加
                    </Button>
                    <Button variant="outlined" onClick={onClose} fullWidth>
                        キャンセル
                    </Button>
                </Box>

                {message && (
                    <Typography color="error" variant="body2">
                        {message}
                    </Typography>
                )}
            </Box>
        </Modal>
    )
}
