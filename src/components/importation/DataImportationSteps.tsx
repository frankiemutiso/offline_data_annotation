import { Box, Button, Step, StepLabel, Stepper, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';
import DataImportComponent from './DataImportComponent';
import DisplayVariablesPicker from './DisplayVariablesPicker';
import { useNavigate } from 'react-router-dom';
import SnackbarAlert from '../SnackbarAlert';
import {
	addColumns,
	addDocumentMetadata,
	addDocuments,
	addLabels,
	clearDatabase,
	getAllColumns,
	getAllDocuments,
	getAllLabels,
} from '../../utils/indexedDbInstance';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
type FileType = {
	name: string;
	size: number;
	type: string;
};

type FileDataType = {
	[key: string]: string | number | boolean | DateConstructor;
};

type LabelType = {
	mode: 'editing' | 'saved';
	name: string;
};

type ColumnType = {
	primary: boolean;
	secondary: boolean;
	name: string;
};

type ErrorSnackbarType = {
	message: string;
	state: boolean;
};

function DataImportationSteps() {
	const [activeStep, setActiveStep] = useState(0);
	const [fileDetails, setFileDetails] = useState<FileType | null>(null);
	const [errorSnackbarOpen, setErrorSnackbarOpen] = useState<ErrorSnackbarType>(
		{ message: '', state: false }
	);
	const [fileData, setFileData] = useState<null | FileDataType[] | void>(null);
	const [columns, setColumns] = useState<ColumnType[]>([]);
	const [labels, setLabels] = useState<LabelType[]>([
		{ name: '', mode: 'editing' },
	]);
	const [dataAvailableBannerOpen, setDataAvailableBannerOpen] = useState(false);

	const theme = useTheme();

	useEffect(() => {
		const fetchData = async () => {
			const [docs, labels, columns] = await Promise.all([
				getAllDocuments(),
				getAllLabels(),
				getAllColumns(),
			]);

			if (
				!docs ||
				docs?.length === 0 ||
				!labels ||
				labels?.length === 0 ||
				!columns ||
				columns?.length === 0
			) {
				return setDataAvailableBannerOpen(false);
			}

			setDataAvailableBannerOpen(true);
		};

		fetchData();
	}, [activeStep]);

	const steps = ['Data Importation', 'Classification Preparation'];

	const navigate = useNavigate();

	const handleNext = async () => {
		if (activeStep === steps.length - 1) {
			if (labels.filter((x) => x.name !== '').length < 2) {
				return setErrorSnackbarOpen({
					message: 'Provide at least 2 labels',
					state: true,
				});
			}

			if (!columns.find((x) => x.primary)) {
				return setErrorSnackbarOpen({
					message: 'Select the primary column to display',
					state: true,
				});
			}

			if (!fileData) return;

			await Promise.all([
				addDocuments(fileData),
				addDocumentMetadata(fileDetails),
				addLabels(labels),
				addColumns(columns),
			]);

			return navigate('/data-classification');
		}

		if (!fileDetails) {
			return setErrorSnackbarOpen({
				message: 'Please upload an Excel/CSV file',
				state: true,
			});
		}

		setActiveStep((prevStep) =>
			prevStep === steps.length - 1 ? prevStep : prevStep + 1
		);
	};

	const handleBack = () => {
		setActiveStep((prevStep) => (prevStep == 0 ? prevStep : prevStep - 1));
	};

	const getStepBody = (value: number) => {
		switch (value) {
			case 0:
				return (
					<DataImportComponent
						fileDetails={fileDetails}
						setFileData={setFileData}
						setFileDetails={setFileDetails}
						setColumns={setColumns}
					/>
				);
			case 1:
				return (
					<DisplayVariablesPicker
						columns={columns}
						labels={labels}
						setLabels={setLabels}
						setColumns={setColumns}
					/>
				);
			default:
				return;
		}
	};

	return (
		<Box
			sx={{
				width: { sm: '50vw', xs: '90vw' },
				margin: 'auto',
				display: 'flex',
				flexDirection: 'column',
				pt: 4,
				pb: 2,
			}}
		>
			<SnackbarAlert
				open={errorSnackbarOpen.state}
				severity='error'
				handleClose={() => setErrorSnackbarOpen({ message: '', state: false })}
				message={errorSnackbarOpen.message}
			/>

			{dataAvailableBannerOpen && (
				<Box
					sx={{
						pb: 4,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
					}}
				>
					<Button
						variant='outlined'
						disableElevation
						onClick={() => {
							clearDatabase();
							setDataAvailableBannerOpen(false);
						}}
						sx={{
							color: theme.palette.error.light,
							borderColor: theme.palette.error.light,
							'&:hover': {
								borderColor: theme.palette.error.light,
								color: theme.palette.error.light,
							},
							ml: { sm: 1, xs: 1 },
						}}
						startIcon={<DeleteOutlinedIcon />}
					>
						Clear Data
					</Button>
					<Button
						variant='contained'
						disableElevation
						color='secondary'
						sx={{ ml: { sm: 1, xs: 1 } }}
						endIcon={<ArrowForwardIcon />}
						onClick={() => navigate('/data-classification')}
					>
						Data classification
					</Button>
				</Box>
			)}

			<Stepper activeStep={activeStep} alternativeLabel>
				{steps.map((label) => {
					const stepProps: { completed?: boolean } = {};
					const labelProps: {
						optional?: React.ReactNode;
					} = {};

					return (
						<Step key={label} {...stepProps}>
							<StepLabel {...labelProps}>{label}</StepLabel>
						</Step>
					);
				})}
			</Stepper>

			<Box>
				<Box sx={{ mt: 3 }}>{getStepBody(activeStep)}</Box>
				<Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
					<Button
						variant='outlined'
						disabled={activeStep === 0}
						onClick={handleBack}
					>
						Back
					</Button>
					<Box sx={{ flex: '1 1 auto' }} />
					<Button onClick={handleNext} variant='contained' disableElevation>
						{activeStep === steps.length - 1 ? 'Proceed To Classify' : 'Next'}
					</Button>
				</Box>
			</Box>
		</Box>
	);
}

export default DataImportationSteps;
