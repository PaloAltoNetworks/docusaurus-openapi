/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

// @ts-nocheck
import React, { useState } from "react";

import { useDoc } from "@docusaurus/theme-common/internal";
import sdk from "@paloaltonetworks/postman-collection";
import Accept from "@theme/ApiDemoPanel/Accept";
import Authorization from "@theme/ApiDemoPanel/Authorization";
import Body from "@theme/ApiDemoPanel/Body";
import buildPostmanRequest from "@theme/ApiDemoPanel/buildPostmanRequest";
import ContentType from "@theme/ApiDemoPanel/ContentType";
import ParamOptions from "@theme/ApiDemoPanel/ParamOptions";
import {
  setResponse,
  setCode,
  clearCode,
  setHeaders,
  clearHeaders,
} from "@theme/ApiDemoPanel/Response/slice";
import Server from "@theme/ApiDemoPanel/Server";
import { useTypedDispatch, useTypedSelector } from "@theme/ApiItem/hooks";
import { ParameterObject } from "docusaurus-plugin-openapi-docs/src/openapi/types";
import { ApiItem } from "docusaurus-plugin-openapi-docs/src/types";
import { useForm } from "react-hook-form";

import makeRequest from "./makeRequest";

function Request({ item }: { item: NonNullable<ApiItem> }) {
  const postman = new sdk.Request(item.postman);
  const metadata = useDoc();
  const { proxy, hide_send_button: hideSendButton } = metadata.frontMatter;

  const pathParams = useTypedSelector((state: any) => state.params.path);
  const queryParams = useTypedSelector((state: any) => state.params.query);
  const cookieParams = useTypedSelector((state: any) => state.params.cookie);
  const contentType = useTypedSelector((state: any) => state.contentType.value);
  const headerParams = useTypedSelector((state: any) => state.params.header);
  const body = useTypedSelector((state: any) => state.body);
  const accept = useTypedSelector((state: any) => state.accept.value);
  const acceptOptions = useTypedDispatch((state: any) => state.accept.options);
  const authSelected = useTypedSelector((state: any) => state.auth.selected);
  const server = useTypedSelector((state: any) => state.server.value);
  const serverOptions = useTypedSelector((state: any) => state.server.options);
  const auth = useTypedSelector((state: any) => state.auth);
  const dispatch = useTypedDispatch();
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  const allParams = [
    ...pathParams,
    ...queryParams,
    ...cookieParams,
    ...headerParams,
  ];

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

  const showServerOptions = serverOptions.length > 0;
  const showAcceptOptions = acceptOptions.length > 1;
  const showRequestBody = contentType !== undefined;
  const showRequestButton = item.servers && !hideSendButton;
  const showAuth = authSelected !== undefined;
  const showParams = allParams.length > 0;
  const requestBodyRequired = item.requestBody?.required;

  if (
    !showAcceptOptions &&
    !showAuth &&
    !showParams &&
    !showRequestBody &&
    !showServerOptions
  ) {
    return null;
  }
  // High level considerations
  // Do we have access to required properties? If so, we can use them to pass now the required prop

  return (
    <>
      <form
        className="openapi-demo__request-form"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="openapi-demo__request-header-container">
          <span className="openapi-demo__request-title">Request </span>
          <span
            className="openapi-demo__expand-details-btn"
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
          >
            {isDetailsOpen ? "Collapse all" : "Expand all"}
          </span>
        </div>
        <div className="openapi-demo__details-outer-container">
          {showServerOptions && (
            <details
              open={isDetailsOpen}
              className="openapi-demo__details-container"
            >
              <summary className="openapi-demo__details-summary">
                Base URL
              </summary>
              <Server />
            </details>
          )}
          {showAuth && (
            <details
              open={isDetailsOpen}
              className="openapi-demo__details-container"
            >
              <summary className="openapi-demo__details-summary">Auth</summary>
              <Authorization />
            </details>
          )}
          {showParams && (
            <details
              open={isDetailsOpen}
              className="openapi-demo__details-container"
            >
              <summary className="openapi-demo__details-summary">
                Parameters
              </summary>
              <ParamOptions errors={errors} register={register} />
            </details>
          )}
          {showRequestBody && (
            <details
              open={isDetailsOpen}
              className="openapi-demo__details-container"
            >
              <summary className="openapi-demo__details-summary">
                Body{" "}
                {requestBodyRequired && (
                  <span>
                    <small>
                      <strong className="request-body required">
                        {" "}
                        required
                      </strong>
                    </small>
                  </span>
                )}
              </summary>
              <>
                <ContentType />
                <Body
                  jsonRequestBodyExample={item.jsonRequestBodyExample}
                  requestBodyMetadata={item.requestBody}
                  register={register}
                />
              </>
            </details>
          )}
          {showAcceptOptions && (
            <details
              open={isDetailsOpen}
              className="openapi-demo__details-container"
            >
              <summary className="openapi-demo__details-summary">
                Accept
              </summary>
              <Accept />
            </details>
          )}
          {showRequestButton && (
            <button className="openapi-demo__request-btn" type="submit">
              Send API Request
            </button>
          )}
        </div>
      </form>
    </>
  );
}

export default Request;
