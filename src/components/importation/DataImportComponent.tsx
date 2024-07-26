import {
	Box,
	Button,
	ButtonBase,
	IconButton,
	Paper,
	Typography,
	useTheme,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ExcelIcon from '../../icons/ExcelIcon';
import CloseIcon from '@mui/icons-material/Close';
import readXlsxFile from 'read-excel-file';
import CsvIcon from '../../icons/CsvIcon';
import Papa from 'papaparse';
import { ChangeEvent, useRef } from 'react';
import {
	clearColumns,
	clearDocumentMetadata,
	clearDocuments,
	clearLabels,
} from '../../utils/indexedDbInstance';

type FileType = {
	name: string;
	size: number;
	type: string;
};

type ColumnType = {
	selected: boolean;
	name: string;
};

type FileDataType = {
	[key: string]: string | number | boolean | DateConstructor;
};

type DataImportComponentProps = {
	setFileData: (data: null | FileDataType[]) => void;
	setFileDetails: (fileDetails: FileType | null) => void;
	fileDetails: FileType | null;
	setColumns: (columns: ColumnType[]) => void;
};

const ACCEPTED_TYPES = [
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'text/csv',
];

function DataImportComponent({
	setFileData,
	setFileDetails,
	fileDetails,
	setColumns,
}: DataImportComponentProps) {
	const theme = useTheme();
	const btnRef = useRef<HTMLInputElement>(null);

	const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
		clearDocuments();
		clearLabels();
		clearColumns();
		clearDocumentMetadata();

		e.preventDefault();

		const newFile: File | null = e.target.files && e.target.files[0];

		if (!newFile) return;

		const { name, type, size } = newFile;
		const fileDetails = {
			name,
			type,
			size,
		};

		if (!ACCEPTED_TYPES.includes(fileDetails.type)) return;

		if (
			fileDetails.type ===
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		) {
			parseExcel(newFile);
		} else {
			parseCsv(newFile);
		}

		setFileDetails(fileDetails);
	};

	const onFileDrop = (e: React.DragEvent) => {
		clearDocuments();
		clearLabels();
		clearColumns();
		clearDocumentMetadata();

		e.preventDefault();

		const newFile: File | null =
			e.dataTransfer.files && e.dataTransfer.files[0];

		if (!newFile) return;

		const { name, type, size } = newFile;
		const fileDetails = {
			name,
			type,
			size,
		};

		if (!ACCEPTED_TYPES.includes(fileDetails.type)) return;

		if (
			fileDetails.type ===
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		) {
			parseExcel(newFile);
		} else {
			parseCsv(newFile);
		}

		setFileDetails(fileDetails);
	};

	const parseExcel = (file: File) => {
		readXlsxFile(file).then((rows) => {
			type dataType = {
				[key: string]: string | number | boolean | DateConstructor;
			};
			let data: dataType[] = [];
			let cols: ColumnType[] = [];

			rows.forEach((d, i) => {
				if (i === 0) {
					cols = d.map((x) => ({ name: x, selected: false })) as ColumnType[];
					setColumns(cols);
				} else {
					let obj: dataType = {};
					cols.forEach((x, i) => {
						const subObj: dataType = {};
						subObj[x.name] = d[i];

						obj = { ...obj, ...subObj };
					});
					data = [...data, obj];
				}
			});

			setColumns([...cols]);
			setFileData(data);
		});
	};

	const parseCsv = (file: File) => {
		const reader = new FileReader();

		reader.onload = async ({ target }) => {
			if (!target || target.result === null) return;

			let result: string;

			if (typeof target.result === 'string') {
				result = target.result;
			} else if (target.result instanceof ArrayBuffer) {
				result = new TextDecoder().decode(target.result);
			} else {
				console.error('Unexpected result type');
				return;
			}

			const csv = Papa.parse(result, {
				header: true,
			});

			const data: FileDataType[] = csv?.data as FileDataType[];

			if (!data) return;

			const cols = Object.keys(data[0]).map((x) => ({
				name: x,
				selected: false,
			}));
			setColumns(cols);
			setFileData(data);
		};
		reader.readAsText(file);
	};

	const fileRemove = () => {
		setFileDetails(null);
		setFileData(null);
		setColumns([]);
	};

	const formatBytes = (bytes: number) => {
		const kilobyte = 1024;
		const megabyte = kilobyte * 1024;
		const gigabyte = megabyte * 1024;

		if (bytes >= gigabyte) {
			return (bytes / gigabyte).toFixed(2) + ' GB';
		} else if (bytes >= megabyte) {
			return (bytes / megabyte).toFixed(2) + ' MB';
		} else if (bytes >= kilobyte) {
			return (bytes / kilobyte).toFixed(2) + ' KB';
		} else {
			return bytes.toFixed(2) + ' bytes';
		}
	};

	return (
		<Paper
			sx={{
				borderRadius: theme.shape.borderRadius,
				width: { xs: '90vw', md: '50vw' },
			}}
		>
			<Box sx={{ height: '100%', p: 2 }}>
				<Box sx={{ mb: 2 }}>
					<Typography variant='body2'>
						Upload an Excel/CSV file for data classification
					</Typography>
				</Box>
				<ButtonBase
					onDrop={onFileDrop}
					onDragOver={(event) => event.preventDefault()}
					sx={{
						border: `2px dashed ${theme.palette.divider}`,
						width: '100%',
						height: '38vh',
						borderRadius: theme.shape.borderRadius,
						outline: 'none',
						'&.hover': {
							border: `2px dashed ${theme.palette.divider}`,
						},
					}}
				>
					<Box>
						<CloudUploadIcon sx={{ fontSize: 48 }} color='primary' />
						<Box
							sx={{
								display: 'flex',
								flexDirection: 'column',
								justifyContent: 'center',
							}}
						>
							<Typography variant='h6'>
								Drop an Excel/CSV file here or{' '}
							</Typography>
							<Button
								disableElevation
								variant='contained'
								onClick={() => {
									if (!btnRef || !btnRef.current) return;
									btnRef.current.click();
								}}
								sx={{ mt: 2 }}
							>
								Choose file
							</Button>
							<input
								ref={btnRef}
								type='file'
								id='avatar'
								name='avatar'
								value=''
								accept='.csv, .xlsx'
								onChange={onFileChange}
								style={{ display: 'none' }}
							/>
						</Box>
					</Box>
				</ButtonBase>
				<Box sx={{ mt: 2 }}>
					{fileDetails && (
						<Paper
							elevation={0}
							sx={{
								height: '100%',
								p: 2,
								background: '#F2F6F7',
								borderRadius: theme.shape.borderRadius,
							}}
						>
							<Box
								sx={{
									display: 'flex',
									width: '100%',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<Box sx={{ display: 'flex' }}>
									{fileDetails.type ===
									'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ? (
										<ExcelIcon color='primary' sx={{ mr: 1, fontSize: 32 }} />
									) : (
										<CsvIcon color='primary' sx={{ mr: 1, fontSize: 32 }} />
									)}
									<Box>
										<Typography variant='body1'>{fileDetails.name}</Typography>
										<Typography variant='caption'>
											{formatBytes(fileDetails.size)}
										</Typography>
									</Box>
								</Box>

								<Box>
									<IconButton onClick={() => fileRemove()}>
										<CloseIcon />
									</IconButton>
								</Box>
							</Box>
						</Paper>
					)}
				</Box>
			</Box>
		</Paper>
	);
}

export default DataImportComponent;
