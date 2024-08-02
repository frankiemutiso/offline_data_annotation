import Cards from '../../components/classification/Cards';
import { Box, Button, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import DownloadIcon from '@mui/icons-material/Download';
import {
	getDocumentMetadata,
	getLabelledDocuments,
} from '../../utils/indexedDbInstance';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';

type FileDataType = {
	[key: string]: string | number | boolean | DateConstructor;
};

function Classification() {
	const navigate = useNavigate();

	const exportToExcel = (data: FileDataType[] | void) => {
		if (!data) return;

		const worksheet = XLSX.utils.json_to_sheet(data);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Labelled Data');

		const excelBuffer = XLSX.write(workbook, {
			bookType: 'xlsx',
			type: 'array',
		});
		const blob = new Blob([excelBuffer], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
		});
		saveAs(blob, 'labelled_data.xlsx');
	};

	const exportToCsv = (data: FileDataType[] | void) => {
		if (!data) return;

		const csvData = Papa.unparse(data);
		const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'labelled_data.csv';
		a.click();
		window.URL.revokeObjectURL(url);
	};

	const downloadLabelledData = async () => {
		const res = await getDocumentMetadata();

		if (!res) return;
		if (res?.length === 0) return;

		const type = res[0].type;
		const docs = await getLabelledDocuments();

		const isExcelType =
			type ===
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

		return isExcelType ? exportToExcel(docs) : exportToCsv(docs);
	};

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
				<Box sx={{ display: 'flex', alignItems: 'center', ml: -1 }}>
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
						Export
					</Button>
				</Box>
			</Box>
			<Cards />
		</Box>
	);
}

export default Classification;
