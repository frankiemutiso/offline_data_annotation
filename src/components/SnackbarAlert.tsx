import { Alert, Snackbar } from '@mui/material';
import React from 'react';

type SnackbarAlertProps = {
	open: boolean;
	handleClose: () => void;
	severity: 'error' | 'success' | 'warning';
	message: string;
};

function SnackbarAlert({
	open,
	severity,
	message,
	handleClose,
}: SnackbarAlertProps) {
	return (
		<Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
			<Alert
				onClose={handleClose}
				severity={severity}
				variant='filled'
				sx={{ width: '100%' }}
			>
				{message}
			</Alert>
		</Snackbar>
	);
}

export default SnackbarAlert;
