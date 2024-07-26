import { useEffect, useState } from 'react';
import DataCard from './DataCard';
import { Box, Grid, Pagination } from '@mui/material';
import { getPaginatedDocuments } from '../../utils/indexedDbInstance';

type DocumentsType = {
	[key: string]: string;
};

type PaginatedResult = {
	data: DocumentsType[];
	count: number;
};

const pageSize = 50;

function Cards() {
	const [documents, setDocuments] = useState<DocumentsType[] | null>(null);
	const [page, setPage] = useState(1);
	const [total, setTotal] = useState(0);

	useEffect(() => {
		const fetchDocs = async () => {
			const response = (await getPaginatedDocuments(page, pageSize)) as
				| PaginatedResult
				| null
				| undefined;

			if (!response) return;

			setTotal(response?.count);
			setDocuments(response?.data);
		};

		fetchDocs();
	}, [page]);

	const count = Math.round(total / pageSize);

	return (
		<Box>
			<Grid container spacing={2}>
				{documents?.map((x, i) => (
					<Grid item md={3} key={i}>
						<DataCard cardDetails={x} />
					</Grid>
				))}
			</Grid>
			<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
				<Pagination
					onChange={(_, page) => setPage(page)}
					count={count}
					variant='outlined'
					shape='rounded'
					sx={{ mt: 2 }}
				/>
			</Box>
		</Box>
	);
}

export default Cards;
