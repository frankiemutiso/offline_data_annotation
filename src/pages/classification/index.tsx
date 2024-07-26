import Cards from '../../components/classification/Cards';
import { Box, Button, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';

function Classification() {
	const navigate = useNavigate();

	const downloadLabelledData = () => {};

	return (
		<Box sx={{ p: 2 }}>
			<Box
				sx={{
					display: { xs: 'flex', sm: 'flex' },
					alignItems: 'center',
					justifyContent: 'space-between',
					mb: 2,
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<IconButton onClick={() => navigate('/')}>
						<ArrowBackIcon />
					</IconButton>
					<Typography variant='h6'>Data Classification</Typography>
				</Box>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
					}}
				>
					<Button
						variant='contained'
						disableElevation
						startIcon={<DownloadIcon />}
						onClick={() => downloadLabelledData()}
					>
						Download
					</Button>
				</Box>
			</Box>
			<Cards />
		</Box>
	);
}

export default Classification;
