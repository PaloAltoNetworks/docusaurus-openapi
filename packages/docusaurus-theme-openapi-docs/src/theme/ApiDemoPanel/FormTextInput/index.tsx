/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
// @ts-nocheck
import React from "react";
import { ErrorMessage } from "@hookform/error-message";

export interface Props {
  value?: string;
  placeholder?: string;
  password?: boolean;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

function FormTextInput({
  isRequired,
  value,
  placeholder,
  password,
  onChange,
  register,
  paramName,
  errors,
}: Props) {
  placeholder = placeholder?.split("\n")[0];

  console.log({ isRequired });
  // const registerInput = register ? {...register.register}
  return (
    <>
      <input
        {...register?.register(paramName, {
          required: "This field is required",
        })}
        className="openapi-demo__input"
        type={password ? "password" : "text"}
        placeholder={placeholder}
        title={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="off"
      />
      {/* <ErrorMessage
        errors={errors}
        name={paramName}
        render={({ message }) => (
          <div className="openapi-demo__error">{message}</div>
        )}
      /> */}
    </>
  );
}

export default FormTextInput;
