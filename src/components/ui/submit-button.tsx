import { Button, ButtonProps } from "./button";

interface SubmitButtonProps extends ButtonProps {
  label: string;
  pending: boolean;
  loading: React.ReactNode;
}

export const SubmitButton = ({
  label,
  pending,
  loading,
  ...props
}: SubmitButtonProps) => {
  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? loading : label}
    </Button>
  );
};
