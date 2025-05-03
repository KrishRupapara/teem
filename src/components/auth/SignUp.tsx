"use client";

import Image from "next/image";
import { Input } from "../ui/input";
import { useActionState, useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { SubmitButton } from "../ui/submit-button";
import { Icons } from "../ui/icons";
import { SignUpAction } from "@/actions/signup";
import { EMPTY_STATE_FORM } from "@/utils/form-message";
import { useToastMessage } from "@/hooks/useToastMessage";
import { FieldError } from "../ui/field-error";
import Link from "next/link";

export default function SignUpComponent() {
    const [state, formAction, pending] = useActionState(
        SignUpAction,
        EMPTY_STATE_FORM
    );
    const [isVisible, setIsVisible] = useState(false);
    const [formValues, setFormValues] = useState({
        username: "",
        email: "",
        password: "",
    });

    useToastMessage(state, "/");

    return (
        <div className="flex w-screen h-screen flex-col items-center gap-6 pt-[8%]">
            <Image
                src={"/images/teem-logo-black.png"}
                alt="TEEM logo"
                width={180}
                height={180}
                className="mb-3"
            />

            <div className="space-y-6">
                <h1>Create your Account</h1>
                <form action={formAction} className="w-[400px] space-y-3">
                    <div>
                        <Input
                            placeholder="Username"
                            id="username"
                            name="username"
                            value={formValues.username}
                            onChange={(e) =>
                                setFormValues({
                                    ...formValues,
                                    username: e.target.value,
                                })
                            }
                        />
                        <FieldError formState={state} name="username" />
                    </div>
                    <div>
                        <Input
                            type="email"
                            placeholder="Email"
                            id="email"
                            name="email"
                            value={formValues.email}
                            onChange={(e) =>
                                setFormValues({
                                    ...formValues,
                                    email: e.target.value,
                                })
                            }
                        />
                        <FieldError formState={state} name="email" />
                    </div>
                    <div>
                        <div className="flex items-center">
                            <Input
                                type={isVisible ? "text" : "password"}
                                placeholder="Passowrd"
                                id="password"
                                name="password"
                                value={formValues.password}
                                onChange={(e) =>
                                    setFormValues({
                                        ...formValues,
                                        password: e.target.value,
                                    })
                                }
                            />

                            <span
                                className="-ml-10 cursor-pointer"
                                onClick={() => setIsVisible((s) => !s)}
                            >
                                {isVisible ? (
                                    <EyeOffIcon className="h-6 w-6" />
                                ) : (
                                    <EyeIcon className="h-6 w-6" />
                                )}
                            </span>
                        </div>
                        <FieldError formState={state} name="password" />
                    </div>
                    <SubmitButton
                        label="Submit"
                        pending={pending}
                        loading={
                            <Icons.spinner className="h-5 w-5 animate-spin" />
                        }
                        className="w-full"
                    />
                </form>
            </div>
            <h1>
                Already have an account?{" "}
                <Link
                    href={"/auth/signin"}
                    className="text-primary font-semibold hover:underline"
                >
                    SignIn
                </Link>
            </h1>
        </div>
    );
}
