import {
	Card,
	CardActions,
	CardContent,
	Chip,
	Typography,
	useTheme,
} from '@mui/material';
import { Fragment, useEffect, useMemo, useState } from 'react';
import {
	getAllColumns,
	getAllLabels,
	updateDocument,
} from '../../utils/indexedDbInstance';

type DocumentsType = {
	[key: string]: string;
};
type DataCardType = {
	cardDetails: DocumentsType;
};
type ColumnDataType = {
	[key: string]: string | boolean;
};
type LabelDataType = {
	[key: string]: string;
};

// const labelColors = ['#204795', '#02A04C', '#F7D704', '#F40009', '#FC8102'];

function DataCard({ cardDetails }: DataCardType) {
	const theme = useTheme();

	const [columns, setColumns] = useState<ColumnDataType[] | null | void>([]);
	const [labels, setLabels] = useState<LabelDataType[] | null | void>([]);

	const [document, setDocument] = useState<DocumentsType | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			const [allColumns, allLabels] = await Promise.all([
				getAllColumns(),
				getAllLabels(),
			]);
			setColumns(allColumns);
			setLabels(allLabels);
		};
		fetchData();
	}, []);

	useEffect(() => {
		setDocument(cardDetails);
	}, [cardDetails]);

	const onClick = (document: DocumentsType | null, label: LabelDataType) => {
		if (!document) return;
		const doc = { ...document, label: label.name };
		setDocument(doc);
		updateDocument(doc);
	};

	const selectedColumn: string | null = useMemo(() => {
		return columns?.find((x) => x.selected !== false)?.name as string;
	}, [columns]);

	if (!selectedColumn || !document) return <Fragment />;

	return (
		<Card
			sx={{ maxWidth: { sm: 345 }, borderRadius: theme.shape.borderRadius }}
		>
			<CardContent sx={{ wordBreak: 'break-word' }}>
				<Typography variant='body2'>{document[selectedColumn]}</Typography>
			</CardContent>
			<CardActions
				sx={{
					pl: 2,
					pb: 2,
					pr: 2,
					display: 'flex',
					justifyContent: 'flex-end',
				}}
			>
				{labels?.map((x) => (
					<Chip
						variant={
							document?.label && x.name === document?.label
								? 'filled'
								: 'outlined'
						}
						color={
							document?.label && x.name === document?.label
								? 'primary'
								: 'default'
						}
						label={x.name}
						key={x.name}
						clickable
						onClick={() => onClick(document, x)}
					/>
				))}
			</CardActions>
		</Card>
	);
}

export default DataCard;
