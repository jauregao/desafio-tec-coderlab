import { Controller, type Control, type FieldValues, type Path, type RegisterOptions } from "react-hook-form";
import { FormField } from "./form-field";
import type { CategoryOption } from "../../types/category";

interface CategorySelectFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  categories: CategoryOption[];
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  emptyValueAsNull?: boolean;
  disabledCategoryIds?: number[];
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
}

export function CategorySelectField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  categories,
  error,
  disabled = false,
  placeholder = "Selecione uma categoria",
  emptyValueAsNull = false,
  disabledCategoryIds = [],
  rules,
}: CategorySelectFieldProps<TFieldValues>) {
  const disabledCategoryIdSet = new Set(disabledCategoryIds);

  return (
    <FormField label={label} error={error}>
      <Controller
        control={control}
        name={name}
        rules={rules}
        render={({ field }) => {
          const selectedValue = field.value ? String(field.value) : "";

          return (
            <select
              className="input-base"
              value={selectedValue}
              disabled={disabled}
              onChange={(event) => {
                const nextValue = Number(event.target.value);

                if (Number.isNaN(nextValue)) {
                  field.onChange(emptyValueAsNull ? null : 0);
                  return;
                }

                field.onChange(nextValue);
              }}
            >
              <option value="">{placeholder}</option>
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                  disabled={disabledCategoryIdSet.has(category.id)}
                >
                  {category.fullPath}
                </option>
              ))}
            </select>
          );
        }}
      />
    </FormField>
  );
}
