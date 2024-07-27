import React from 'react';
import {
	Box,
	Button,
	Chip,
	Divider,
	IconButton,
	Paper,
	TextField,
	Typography,
	useTheme,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/EditOutlined';

type LabelType = {
	mode: 'editing' | 'saved';
	name: string;
};

type ColumnType = {
	secondary: boolean;
	primary: boolean;
	name: string;
};

type DisplayVariablesPickerProps = {
	columns: ColumnType[];
	labels: LabelType[];
	setLabels: (labels: LabelType[]) => void;
	setColumns: (columns: ColumnType[]) => void;
};

function DisplayVariablesPicker({
	columns,
	labels,
	setLabels,
	setColumns,
}: DisplayVariablesPickerProps) {
	const theme = useTheme();

	const handleChange = (value: string, index: number) => {
		const labelCopy = [...labels];
		labelCopy[index]['name'] = value;
		setLabels(labelCopy);
	};

	const onSubmit = (value: string, index: number) => {
		onUpdate(value, index);
	};

	const onUpdate = (value: string, index: number) => {
		if (value.length === 0) return;
		const labelCopy = [...labels];
		labelCopy[index]['name'] = value;
		labelCopy[index]['mode'] = 'saved';
		setLabels(labelCopy);
	};

	const onKeyDown = (
		e: React.KeyboardEvent<HTMLDivElement>,
		value: string,
		index: number
	) => {
		if (e.key !== 'Enter') return;

		onUpdate(value, index);
	};

	const handleEdit = (index: number) => {
		const labelCopy = [...labels];
		labelCopy[index]['mode'] = 'editing';
		setLabels(labelCopy);
	};

	const handleClick = (
		newSelected: ColumnType,
		columnType: 'primary' | 'secondary'
	) => {
		const columnsCopy = [...columns];

		const handlePrimarySelection = () => {
			const currentSelectedIndex = columns.findIndex(
				(x: ColumnType) => x.primary
			);
			const currentSelected = columns[currentSelectedIndex];

			const selectedIndex = columnsCopy.findIndex(
				(x) => x.name === newSelected.name
			);

			if (selectedIndex === -1) return;

			columnsCopy[selectedIndex] = {
				name: newSelected.name,
				primary: columnType === 'primary',
				secondary: false,
			};

			if (currentSelected) {
				columnsCopy[currentSelectedIndex] = {
					name: currentSelected?.name,
					primary: false,
					secondary: false,
				};
			}

			return setColumns(columnsCopy);
		};

		const handleSecondarySelections = () => {
			const selectedIndex = columnsCopy.findIndex(
				(x) => x.name === newSelected.name
			);

			if (selectedIndex === -1) return;

			columnsCopy[selectedIndex] = {
				name: newSelected.name,
				primary: false,
				secondary: newSelected.secondary ? false : true,
			};

			return setColumns(columnsCopy);
		};

		switch (columnType) {
			case 'primary':
				return handlePrimarySelection();
			case 'secondary':
				return handleSecondarySelections();
			default:
				break;
		}
	};

	return (
		<Paper
			sx={{ p: 2, borderRadius: theme.shape.borderRadius, mineight: '54.5vh' }}
		>
			<Box sx={{ mb: 2 }}>
				<Typography sx={{ mb: 1 }}>
					Select the primary column to display
				</Typography>
				{columns.map((x: ColumnType) => {
					const selectedColumn = columns.find((x: ColumnType) => x.primary);

					return (
						<Chip
							label={x.name}
							key={x.name}
							color={selectedColumn?.name === x.name ? 'primary' : 'default'}
							sx={{ mr: 1, mb: 1 }}
							onClick={() => handleClick(x, 'primary')}
						/>
					);
				})}
			</Box>
			<Divider />
			<Box sx={{ mb: 2, mt: 2 }}>
				<Typography sx={{ mb: 1 }}>Select other columns to display</Typography>
				{columns.map((x: ColumnType) => {
					const selectedColumns = columns
						.filter((x: ColumnType) => x.secondary === true)
						.map((c) => c.name);

					return (
						<Chip
							label={x.name}
							key={x.name}
							color={selectedColumns.includes(x.name) ? 'primary' : 'default'}
							sx={{ mr: 1, mb: 1 }}
							onClick={() => handleClick(x, 'secondary')}
						/>
					);
				})}
			</Box>
			<Divider />
			<Box sx={{ mt: 2 }}>
				<Typography>
					Provide at least 2 classification labels eg. True, False etc.
				</Typography>
				<Box sx={{ mt: 1, width: '100%' }}>
					{labels.map((x, i: number) => (
						<Box sx={{ mb: 1, display: 'flex' }} key={i}>
							{x.mode === 'saved' ? (
								<Typography sx={{ width: '90%', pl: 1.8, pt: 0.95 }}>
									{x.name}
								</Typography>
							) : (
								<TextField
									id='outlined-basic'
									variant='outlined'
									placeholder='Type and press ENTER'
									size='small'
									onChange={(e) => handleChange(e.target.value, i)}
									sx={{ width: '92%' }}
									value={x.name}
									onKeyDown={(e) => onKeyDown(e, x.name, i)}
								/>
							)}
							<IconButton
								sx={{ ml: 1 }}
								onClick={() =>
									x.mode === 'saved' ? handleEdit(i) : onSubmit(x.name, i)
								}
							>
								{x.mode === 'saved' ? <EditIcon /> : <CheckIcon />}
							</IconButton>
						</Box>
					))}
				</Box>
				<Button
					size='small'
					sx={{ borderRadius: '999px', px: 2, py: 1, mt: 2 }}
					onClick={() => {
						const newLabel: LabelType = { mode: 'editing', name: '' };
						setLabels([...labels, newLabel]);
					}}
					disabled={labels.length > 4}
				>
					Add new label
				</Button>
			</Box>
		</Paper>
	);
}

export default DisplayVariablesPicker;
