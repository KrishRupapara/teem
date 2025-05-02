import { ZodError } from "zod";

export interface FormState {
    status: "UNSET" | "SUCCESS" | "ERROR";
    message: string;
    fieldErrors: Record<string, string[] | undefined>;
    timestamp: number;
}

export const EMPTY_STATE_FORM: FormState = {
    status: "UNSET",
    message: "",
    fieldErrors: {},
    timestamp: Date.now(),
};

export const formStateToError = (error: unknown): FormState => {
    if (error instanceof ZodError)
        return {
            status: "ERROR" as const,
            message: "",
            fieldErrors: error.flatten().fieldErrors,
            timestamp: Date.now(),
        };

    return {
        status: "ERROR" as const,
        message: "An unkown error occured",
        fieldErrors: {},
        timestamp: Date.now(),
    };
};

export const toFormState = (
    status: FormState["status"],
    message: string
): FormState => {
    return {
        status,
        message,
        fieldErrors: {},
        timestamp: Date.now(),
    };
};
