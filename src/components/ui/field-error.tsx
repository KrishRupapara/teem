import { FormState } from "@/utils/form-message";
import { FC } from "react";

interface FieldErrorProps {
    formState: FormState;
    name: string;
}

export const FieldError: FC<FieldErrorProps> = ({ formState, name }) => {
    return (
        <span className="text-xs text-destructive">
            {formState.fieldErrors[name]?.[0]}
        </span>
    );
};
