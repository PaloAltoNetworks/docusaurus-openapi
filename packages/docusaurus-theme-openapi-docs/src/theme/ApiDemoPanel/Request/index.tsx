/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */
// @ts-nocheck
import React from "react";

import { useDoc } from "@docusaurus/theme-common/internal";
import sdk from "@paloaltonetworks/postman-collection";
import Accept from "@theme/ApiDemoPanel/Accept";
import Authorization from "@theme/ApiDemoPanel/Authorization";
import Body from "@theme/ApiDemoPanel/Body";
import ContentType from "@theme/ApiDemoPanel/ContentType";
import Execute from "@theme/ApiDemoPanel/Execute";
import ParamOptions from "@theme/ApiDemoPanel/ParamOptions";
import Server from "@theme/ApiDemoPanel/Server";
import { useTypedSelector } from "@theme/ApiItem/hooks";
import { ParameterObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";
import { ApiItem } from "docusaurus-plugin-openapi-docs/src/types";
import { useForm } from "react-hook-form";
import buildPostmanRequest from "@theme/ApiDemoPanel/buildPostmanRequest";
import makeRequest from "./makeRequest";
import {
  setResponse,
  setCode,
  clearCode,
  setHeaders,
  clearHeaders,
} from "@theme/ApiDemoPanel/Response/slice";
import { useTypedDispatch, useTypedSelector } from "@theme/ApiItem/hooks";

function Request({ item }: { item: NonNullable<ApiItem> }) {
  const response = useTypedSelector((state: any) => state.response.value);
  const postman = new sdk.Request(item.postman);
  const metadata = useDoc();
  const { proxy, hide_send_button } = metadata.frontMatter;

  const pathParams = useTypedSelector((state: any) => state.params.path);
  const queryParams = useTypedSelector((state: any) => state.params.query);
  const cookieParams = useTypedSelector((state: any) => state.params.cookie);
  const headerParams = useTypedSelector((state: any) => state.params.header);
  const contentType = useTypedSelector((state: any) => state.contentType.value);
  const body = useTypedSelector((state: any) => state.body);
  const accept = useTypedSelector((state: any) => state.accept.value);
  const acceptOptions = useTypedDispatch((state: any) => state.accept.options);
  const server = useTypedSelector((state: any) => state.server.value);
  const serverOptions = useTypedSelector((state: any) => state.server.options);
  const params = useTypedSelector((state: any) => state.params);
  const auth = useTypedSelector((state: any) => state.auth);
  const dispatch = useTypedDispatch();

  const postmanRequest = buildPostmanRequest(postman, {
    queryParams,
    pathParams,
    cookieParams,
    contentType,
    accept,
    headerParams,
    body,
    server,
    auth,
  });

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const paramsObject = {
    path: [] as ParameterObject[],
    query: [] as ParameterObject[],
    header: [] as ParameterObject[],
    cookie: [] as ParameterObject[],
  };

  item.parameters?.forEach(
    (param: { in: "path" | "query" | "header" | "cookie" }) => {
      const paramType = param.in;
      const paramsArray: ParameterObject[] = paramsObject[paramType];
      paramsArray.push(param as ParameterObject);
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async () => {
    console.log("React Form Hook button clicked");
    dispatch(setResponse("Fetching..."));
    try {
      await delay(1200);
      const res = await makeRequest(postmanRequest, proxy, body);
      dispatch(setResponse(await res.text()));
      dispatch(setCode(res.status));
      res.headers && dispatch(setHeaders(Object.fromEntries(res.headers)));
    } catch (e: any) {
      console.log(e);
      dispatch(setResponse("Connection failed"));
      dispatch(clearCode());
      dispatch(clearHeaders());
    }
  };

  const showServerOptions = serverOptions > 0;
  const showAcceptOptions = acceptOptions > 1;

  console.log({ errors, accept });
  // High level considerations
  // Do we have access to required properties? If so, we can use them to pass now the required prop

  return (
    <>
      <details className="openapi-demo__details" open={response ? false : true}>
        <summary className="openapi-demo__summary-container">
          <h4 className="openapi-demo__summary-header">Request</h4>
        </summary>
        <div className="openapi-demo__options-panel">
          <form onSubmit={handleSubmit(onSubmit)}>
            {showServerOptions && (
              <details>
                <summary>Base URL</summary>
                <Server />
              </details>
            )}
            <details>
              <summary>Auth</summary>
              <Authorization />
            </details>
            <details>
              <summary>Parameters</summary>
              <ParamOptions register={register} />
            </details>
            <details>
              <summary>Body</summary>
              <>
                <ContentType />
                <Body
                  jsonRequestBodyExample={item.jsonRequestBodyExample}
                  requestBodyMetadata={item.requestBody}
                  register={register}
                />
              </>
            </details>
            {showAcceptOptions && (
              <details>
                <summary>Accept</summary>
                <Accept />
              </details>
            )}
            {item.servers && !hide_send_button && (
              <button type="submit" value="Submit">
                Send API Request
              </button>
            )}
          </form>
        </div>
      </details>
    </>
  );
}

export default Request;
