import { useCallback, useState } from "react";

export function useDeleteConfirmation(onConfirmDelete: (id: number) => Promise<void>) {
	const [itemToDelete, setItemToDelete] = useState<number | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const requestDelete = useCallback((id: number) => {
		setItemToDelete(id);
	}, []);

	const cancelDelete = useCallback(() => {
		setItemToDelete(null);
	}, []);

	const confirmDelete = useCallback(() => {
		if (itemToDelete == null) {
			return;
		}

		setIsDeleting(true);

		void onConfirmDelete(itemToDelete).finally(() => {
			setIsDeleting(false);
			setItemToDelete(null);
		});
	}, [itemToDelete, onConfirmDelete]);

	return {
		itemToDelete,
		isDeleting,
		requestDelete,
		cancelDelete,
		confirmDelete,
	};
}