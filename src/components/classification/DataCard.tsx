import {
	Box,
	Card,
	CardActions,
	CardContent,
	Chip,
	Collapse,
	IconButton,
	IconButtonProps,
	styled,
	Typography,
	useTheme,
} from '@mui/material';
import { Fragment, useEffect, useMemo, useState } from 'react';
import {
	getAllColumns,
	getAllLabels,
	updateDocument,
} from '../../utils/indexedDbInstance';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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

interface ExpandMoreProps extends IconButtonProps {
	expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
	const { expand, ...other } = props;
	console.log(expand);
	return <IconButton {...other} />;
})(({ theme, expand }) => ({
	transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
	marginLeft: 'auto',
	transition: theme.transitions.create('transform', {
		duration: theme.transitions.duration.shortest,
	}),
}));

function DataCard({ cardDetails }: DataCardType) {
	const theme = useTheme();

	const [columns, setColumns] = useState<ColumnDataType[] | null | void>([]);
	const [labels, setLabels] = useState<LabelDataType[] | null | void>([]);
	const [document, setDocument] = useState<DocumentsType | null>(null);
	const [expanded, setExpanded] = useState(false);

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
		return columns?.find((x) => x.primary)?.name as string;
	}, [columns]);

	if (!selectedColumn || !document) return <Fragment />;

	const getSecondaryData = () => {
		if (!columns) return [];

		const secondaryCols = columns.filter((x) => x.secondary);

		const data = secondaryCols.map((x) => ({
			key: x.name,
			value: cardDetails[`${x.name}`],
		}));

		return data;
	};

	return (
		<Card
			sx={{
				maxWidth: { sm: 345, height: '100%' },
				borderRadius: theme.shape.borderRadius,
			}}
		>
			<CardContent sx={{ wordBreak: 'break-word' }}>
				<Typography variant='body1'>{document[selectedColumn]}</Typography>
			</CardContent>
			<CardActions
				sx={{
					pl: 2,
					pb: 2,
					pr: 2,
					display: 'flex',
					justifyContent: 'space-between',
				}}
			>
				<Box>
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
							sx={{ mr: 1 }}
						/>
					))}
				</Box>
				{getSecondaryData()?.length > 0 && (
					<ExpandMore
						expand={expanded}
						onClick={() => setExpanded((prev) => !prev)}
						aria-expanded={expanded}
						aria-label='show more'
					>
						<ExpandMoreIcon />
					</ExpandMore>
				)}
			</CardActions>
			<Collapse in={expanded} timeout='auto' unmountOnExit>
				<CardContent>
					{getSecondaryData()?.map((obj) => (
						<Box sx={{ mb: 1 }}>
							<Typography variant='overline'>
								<b>{obj.key}</b>
							</Typography>
							<Typography variant='body1'>{obj.value}</Typography>
						</Box>
					))}
				</CardContent>
			</Collapse>
		</Card>
	);
}

export default DataCard;
