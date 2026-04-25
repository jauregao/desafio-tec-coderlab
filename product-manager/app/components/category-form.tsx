import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { CategorySelectField } from "./form/category-select-field";
import { FormActions } from "./form/form-actions";
import { FormField } from "./form/form-field";
import type { CategoryFormValues, CategoryOption } from "../types/category";

interface CategoryFormProps {
  categories: CategoryOption[];
  disabledParentIds?: number[];
  initialValues?: CategoryFormValues;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}

const defaultValues: CategoryFormValues = {
  name: "",
  parentId: null,
};

export function CategoryForm({
  categories,
  disabledParentIds = [],
  initialValues,
  isSubmitting,
  onCancel,
  onSubmit,
}: CategoryFormProps) {
  const isEditing = Boolean(initialValues);
  const disabledParentIdSet = new Set(disabledParentIds);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm<CategoryFormValues>({
    defaultValues: initialValues ?? defaultValues,
  });

  useEffect(() => {
    reset(initialValues ?? defaultValues);
  }, [initialValues, reset]);

  return (
    <form
      className="surface-card grid gap-4 p-4"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-lg font-semibold text-[#07010F]">
        {isEditing ? "Editar Categoria" : "Nova Categoria"}
      </h2>

      <FormField label="Nome" error={errors.name?.message?.toString()}>
        <input
          type="text"
          className="input-base"
          placeholder="Ex.: Eletronicos"
          {...register("name", { required: "Nome obrigatorio" })}
        />
      </FormField>

      <CategorySelectField
        control={control}
        name="parentId"
        label="Hierarquia de categorias"
        categories={categories}
        disabledCategoryIds={disabledParentIds}
        emptyValueAsNull
        placeholder="-"
        error={errors.parentId?.message?.toString()}
        rules={{
          validate: (value) =>
            value == null || value === "" || !disabledParentIdSet.has(Number(value)) ||
            "Selecione uma categoria pai válida",
        }}
      />

      <FormActions
        isSubmitting={isSubmitting}
        submitLabel={isEditing ? "Salvar alterações" : "Criar categoria"}
        showCancel={isEditing}
        cancelLabel="Cancelar edição"
        onCancel={onCancel}
      />
    </form>
  );
}
