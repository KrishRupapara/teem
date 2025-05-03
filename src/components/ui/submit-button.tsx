import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "./button";
import { useFormStatus } from "react-dom";

interface SubmitButtonProps extends ButtonProps {
    label: string;
    pending: boolean;
    loading: React.ReactNode;
}

export const SubmitButton = ({
    className,
    label,
    pending,
    loading,
    ...props
}: SubmitButtonProps) => {
    return (
        <Button
            type="submit"
            className={cn("cursor-pointer", className)}
            disabled={pending}
            {...props}
        >
            {pending ? loading : label}
        </Button>
    );
};
