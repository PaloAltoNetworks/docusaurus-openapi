/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import FormItem from "../FormItem";
import FormSelect from "../FormSelect";
import FormTextInput from "../FormTextInput";
import { useTypedDispatch, useTypedSelector } from "../hooks";
import styles from "../styles.module.css";
import { AuthState, Scheme, setAuthData, setSelectedAuth } from "./slice";

function validateData(selectedAuth: Scheme[], data: AuthState["data"]) {
  for (const scheme of selectedAuth) {
    if (data[scheme.key] === undefined) {
      return false;
    }
    const hasMissingKeys = Object.values(data[scheme.key]).includes(undefined);
    if (hasMissingKeys) {
      return false;
    }
  }
  return true;
}

function Authorization() {
  const data = useTypedSelector((state) => state.auth.data);
  const options = useTypedSelector((state) => state.auth.options);
  const selected = useTypedSelector((state) => state.auth.selected);

  const dispatch = useTypedDispatch();

  if (selected === undefined) {
    return null;
  }

  const selectedAuth = options[selected];

  const optionKeys = Object.keys(options);

  return (
    <div>
      {optionKeys.length > 1 && (
        <FormItem label="Security Scheme">
          <FormSelect
            options={optionKeys}
            value={selected}
            onChange={(e) => {
              dispatch(setSelectedAuth(e.target.value));
            }}
          />
        </FormItem>
      )}
      {selectedAuth.map((a) => {
        if (a.type === "http" && a.scheme === "bearer") {
          return (
            <FormItem label="Bearer Token" key={selected + "-bearer"}>
              <FormTextInput
                placeholder="Bearer Token"
                value={data[a.key].token ?? ""}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  dispatch(
                    setAuthData({
                      scheme: a.key,
                      key: "token",
                      value: value ? value : undefined,
                    })
                  );
                }}
              />
            </FormItem>
          );
        }

        if (a.type === "oauth2") {
          return (
            <FormItem label="Bearer Token" key={selected + "-oauth2"}>
              <FormTextInput
                placeholder="Bearer Token"
                value={data[a.key].token ?? ""}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  dispatch(
                    setAuthData({
                      scheme: a.key,
                      key: "token",
                      value: value ? value : undefined,
                    })
                  );
                }}
              />
            </FormItem>
          );
        }

        if (a.type === "http" && a.scheme === "basic") {
          return (
            <React.Fragment key={selected + "-basic"}>
              <FormItem label="Username">
                <FormTextInput
                  placeholder="Username"
                  value={data[a.key].username ?? ""}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    dispatch(
                      setAuthData({
                        scheme: a.key,
                        key: "username",
                        value: value ? value : undefined,
                      })
                    );
                  }}
                />
              </FormItem>
              <FormItem label="Password">
                <FormTextInput
                  placeholder="Password"
                  password
                  value={data[a.key].password ?? ""}
                  onChange={(e) => {
                    const value = e.target.value.trim();
                    dispatch(
                      setAuthData({
                        scheme: a.key,
                        key: "password",
                        value: value ? value : undefined,
                      })
                    );
                  }}
                />
              </FormItem>
            </React.Fragment>
          );
        }

        if (a.type === "apiKey") {
          return (
            <FormItem label={`${a.key}`} key={selected + "-apikey"}>
              <FormTextInput
                placeholder={`${a.key}`}
                value={data[a.key].apiKey ?? ""}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  dispatch(
                    setAuthData({
                      scheme: a.key,
                      key: "apiKey",
                      value: value ? value : undefined,
                    })
                  );
                }}
              />
            </FormItem>
          );
        }

        return null;
      })}
    </div>
  );
}

export default Authorization;
