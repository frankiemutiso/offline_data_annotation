type FileDataType = {
	[key: string]: string | number | boolean | DateConstructor;
};
type ColumnDataType = {
	[key: string]: string | boolean;
};
type LabelDataType = {
	[key: string]: string;
};

type PaginatedResult = {
	data: FileDataType[];
	count: number;
};

type FileType = {
	name: string;
	type: string;
	size: number;
};

const openRequest = window.indexedDB.open('data_annotator_db', 2);

let db!: IDBDatabase;

openRequest.onupgradeneeded = function () {
	db = openRequest.result;

	if (!db.objectStoreNames.contains('documents')) {
		db.createObjectStore('documents', { keyPath: 'id', autoIncrement: true });
	}

	if (!db.objectStoreNames.contains('labels')) {
		db.createObjectStore('labels', { keyPath: 'id', autoIncrement: true });
	}

	if (!db.objectStoreNames.contains('columns')) {
		db.createObjectStore('columns', { keyPath: 'id', autoIncrement: true });
	}

	if (!db.objectStoreNames.contains('document_metadata')) {
		db.createObjectStore('document_metadata', {
			keyPath: 'id',
			autoIncrement: true,
		});
	}
};

openRequest.onerror = function () {
	console.error('Error', openRequest.error);
};

openRequest.onsuccess = function () {
	db = openRequest.result;
	console.log('Database connection established!');
};

export const addDocuments = (documents: FileDataType[]) => {
	const transaction = db.transaction('documents', 'readwrite');
	const objectStore = transaction.objectStore('documents');

	Promise.all(
		documents.map(
			(document) =>
				new Promise<void>((resolve, reject) => {
					const request = objectStore.add(document);
					request.onsuccess = () => resolve();
					request.onerror = () => reject(request.error);
				})
		)
	)
		.then(() => {
			console.log('All Documents added successfully');
		})
		.catch((error) => {
			console.error('Error adding documents:', error);
		});
};

export const getAllDocuments = async () => {
	const transaction = db.transaction('documents', 'readonly');
	const objectStore = transaction.objectStore('documents');

	return Promise.all([
		new Promise<FileDataType[]>((resolve, reject) => {
			const request = objectStore.getAll();
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		}),
	])
		.then((result) => {
			if (!result && new Array(result).length === 0) return;
			return result[0];
		})
		.catch((error) => {
			console.error('Error getting documents:', error);
		});
};

export const getPaginatedDocuments = async (page: number, pageSize: number) => {
	const transaction = db.transaction('documents', 'readonly');
	const objectStore = transaction.objectStore('documents');

	return Promise.all([
		new Promise<PaginatedResult>((resolve, reject) => {
			const records: FileDataType[] = [];
			const lowerLimit = (page - 1) * pageSize;
			const limit = pageSize;
			let count = 0;

			const cursorRequest = objectStore.openCursor();
			const total = objectStore.count();

			cursorRequest.onsuccess = () => {
				const cursor = cursorRequest.result;

				if (cursor && count < lowerLimit) {
					// this piece of code can be improved to just skip to the desired record
					count += 1;
					cursor.continue();
				} else if (cursor && records.length < limit) {
					records.push(cursor.value);
					cursor.continue();
				} else {
					resolve({ data: records, count: total.result });
				}
			};
			cursorRequest.onerror = () => reject(cursorRequest.error);
		}),
	])
		.then((result) => {
			if (!result && new Array(result).length === 0) return;
			return result[0];
		})
		.catch((error) => {
			console.error('Error getting documents:', error);
		});
};

export const getDocumentsCount = async () => {
	const transaction = db.transaction('documents', 'readonly');
	const objectStore = transaction.objectStore('documents');

	return new Promise<number>((resolve, reject) => {
		const request = objectStore.count();
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error);
	})
		.then((result) => {
			return result;
		})
		.catch((error) => {
			console.error('Error getting document count:', error);
		});
};

export const clearDocuments = () => {
	const transaction = db.transaction('documents', 'readwrite');
	const objectStore = transaction.objectStore('documents');
	const request = objectStore.clear();

	request.onsuccess = function () {
		console.log('Documents object store cleared', request.result);
	};
	request.onerror = function () {
		console.log('Error', request.error);
	};
};

export const addLabels = async (labels: LabelDataType[]) => {
	const transaction = db.transaction('labels', 'readwrite');
	const objectStore = transaction.objectStore('labels');

	return Promise.all(
		labels.map(
			(label) =>
				new Promise<IDBValidKey>((resolve, reject) => {
					const request = objectStore.add(label);
					request.onsuccess = () => resolve(request.result);
					request.onerror = () => reject(request.error);
				})
		)
	)
		.then((result) => {
			console.log('All Labels added successfully');
			return result;
		})
		.catch((error) => {
			console.error('Error adding labels:', error);
			return error;
		});
};

export const getAllLabels = async () => {
	const transaction = db.transaction('labels', 'readonly');
	const objectStore = transaction.objectStore('labels');

	return Promise.all([
		new Promise<LabelDataType[]>((resolve, reject) => {
			const request = objectStore.getAll();
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		}),
	])
		.then((result) => {
			if (!result && new Array(result).length === 0) return;
			return result[0];
		})
		.catch((error) => {
			console.error('Error getting labels:', error);
		});
};

export const clearLabels = () => {
	const transaction = db.transaction('labels', 'readwrite');
	const objectStore = transaction.objectStore('labels');
	const request = objectStore.clear();

	request.onsuccess = function () {
		console.log('Labels object store cleared', request.result);
	};
	request.onerror = function () {
		console.log('Error', request.error);
	};
};

export const addColumns = async (columns: ColumnDataType[]) => {
	const transaction = db.transaction('columns', 'readwrite');
	const objectStore = transaction.objectStore('columns');

	return Promise.all(
		columns.map(
			(column) =>
				new Promise<IDBValidKey>((resolve, reject) => {
					const request = objectStore.add(column);
					request.onsuccess = () => resolve(request.result);
					request.onerror = () => reject(request.error);
				})
		)
	)
		.then((result) => {
			console.log('All Columns added successfully');
			return result;
		})
		.catch((error) => {
			console.error('Error adding columns:', error);
			return error;
		});
};

export const getAllColumns = async () => {
	const transaction = db.transaction('columns', 'readonly');
	const objectStore = transaction.objectStore('columns');

	return Promise.all([
		new Promise<ColumnDataType[]>((resolve, reject) => {
			const request = objectStore.getAll();
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		}),
	])
		.then((result) => {
			if (!result && new Array(result).length === 0) return null;
			return result[0];
		})
		.catch((error) => {
			console.error('Error getting columns:', error);
		});
};

export const clearColumns = () => {
	const transaction = db.transaction('columns', 'readwrite');
	const objectStore = transaction.objectStore('columns');
	const request = objectStore.clear();

	request.onsuccess = function () {
		console.log('Columns object store cleared', request.result);
	};
	request.onerror = function () {
		console.log('Error', request.error);
	};
};

export const addDocumentMetadata = async (document: FileType | null) => {
	const transaction = db.transaction('document_metadata', 'readwrite');
	const objectStore = transaction.objectStore('document_metadata');

	return Promise.all([
		new Promise<IDBValidKey>((resolve, reject) => {
			const request = objectStore.add(document);
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		}),
	])
		.then((result) => {
			console.log('Document metadata added successfully');
			return result;
		})
		.catch((error) => {
			console.error('Error adding document metadata:', error);
			return error;
		});
};

export const getDocumentMetadata = async () => {
	const transaction = db.transaction('document_metadata', 'readonly');
	const objectStore = transaction.objectStore('document_metadata');

	return Promise.all([
		new Promise<ColumnDataType[]>((resolve, reject) => {
			const request = objectStore.getAll();
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		}),
	])
		.then((result) => {
			if (!result && new Array(result).length === 0) return null;
			return result[0];
		})
		.catch((error) => {
			console.error('Error getting document metadata:', error);
		});
};

export const clearDocumentMetadata = () => {
	const transaction = db.transaction('document_metadata', 'readwrite');
	const objectStore = transaction.objectStore('document_metadata');
	const request = objectStore.clear();

	request.onsuccess = function () {
		console.log('Document metadata object store cleared', request.result);
	};
	request.onerror = function () {
		console.log('Error', request.error);
	};
};

export const updateDocument = (document: ColumnDataType) => {
	const transaction = db.transaction('documents', 'readwrite');
	const documents = transaction.objectStore('documents');
	const request = documents.put(document);

	request.onsuccess = function () {
		console.log('Updated the document successfully: ', request.result);
	};

	request.onerror = function () {
		console.log('Error', request.error);
	};
};

export const clearDatabase = () => {
	clearColumns();
	clearDocumentMetadata();
	clearLabels();
	clearDocuments();
};
