import React from "react";
export interface Props {
    value?: string;
    options?: string[];
    onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}
declare function FormSelect({ value, options, onChange }: Props): JSX.Element | null;
export default FormSelect;
