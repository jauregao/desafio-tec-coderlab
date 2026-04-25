import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { CategorySelectField } from "./form/category-select-field";
import { FormActions } from "./form/form-actions";
import { FormField } from "./form/form-field";
import type { CategoryOption } from "../types/category";
import type { ProductFormValues } from "../types/product";

interface ProductFormProps {
	categories: CategoryOption[];
	initialValues?: ProductFormValues;
	isSubmitting: boolean;
	onCancelEdit: () => void;
	onSubmit: (values: ProductFormValues) => Promise<void>;
}

const defaultValues: ProductFormValues = {
	name: "",
	description: "",
	price: 0,
	categoryId: 0,
};

export function ProductForm({
	categories,
	initialValues,
	isSubmitting,
	onCancelEdit,
	onSubmit,
}: ProductFormProps) {
  const isEditing = Boolean(initialValues);

	const resolvedInitialValues = useMemo<ProductFormValues>(() => {
		return initialValues ?? defaultValues;
	}, [initialValues]);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
		control,
	} = useForm<ProductFormValues>({
		defaultValues: resolvedInitialValues,
	});

	useEffect(() => {
		reset(resolvedInitialValues);
	}, [reset, resolvedInitialValues]);

	return (
		<form
			className="surface-card grid gap-4 p-4"
			onSubmit={handleSubmit(onSubmit)}
		>
			<h2 className="text-lg font-semibold text-[#07010F]">
				{isEditing ? "Editar Produto" : "Novo Produto"}
			</h2>

			<FormField label="Nome" error={errors.name?.message?.toString()}>
				<input
					type="text"
					className="input-base"
					placeholder="Ex.: Camiseta"
					{...register("name", { required: "Nome obrigatorio" })}
				/>
			</FormField>

			<FormField label="Descrição" error={errors.description?.message?.toString()}>
				<textarea
					rows={3}
					className="input-base"
					placeholder="Descrição do produto"
					{...register("description", { required: "Descrição obrigatoria" })}
				/>
			</FormField>

			<FormField label="Preço" error={errors.price?.message?.toString()}>
				<input
					type="number"
					min="0"
					step="0.01"
					className="input-base"
					{...register("price", {
						required: "Preco obrigatorio",
						valueAsNumber: true,
						min: { value: 0, message: "Preco deve ser maior ou igual a 0" },
					})}
				/>
			</FormField>

			<CategorySelectField
				control={control}
				name="categoryId"
				label="Categorias"
				categories={categories}
				disabled={isSubmitting}
				error={errors.categoryId?.message?.toString()}
				rules={{
					validate: (value) => Number(value) > 0 || "Selecione ao menos uma categoria",
				}}
			/>

			<FormActions
				isSubmitting={isSubmitting}
				submitLabel={isEditing ? "Salvar alterações" : "Criar produto"}
				showCancel={isEditing}
				cancelLabel="Cancelar edição"
				onCancel={onCancelEdit}
			/>
		</form>
	);
}
