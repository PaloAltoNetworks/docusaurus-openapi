/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React from "react";

import ResponseSamples from "@theme/ResponseSamples";
import TabItem from "@theme/TabItem";
import { createDescription } from "docusaurus-plugin-openapi-docs/lib/markdown/createDescription";
import { sampleResponseFromSchema } from "docusaurus-plugin-openapi-docs/lib/openapi/createResponseExample";
import format from "xml-formatter";

export function json2xml(o: Record<string, any>, tab: string): string {
  const toXml = (v: any, name: string, ind: string): string => {
    let xml = "";
    if (v instanceof Array) {
      for (let i = 0, n = v.length; i < n; i++) {
        xml += ind + toXml(v[i], name, ind + "\t") + "\n";
      }
    } else if (typeof v === "object") {
      let hasChild = false;
      xml += ind + "<" + name;
      for (const m in v) {
        if (m.charAt(0) === "@") {
          xml += " " + m.substr(1) + '="' + v[m].toString() + '"';
        } else {
          hasChild = true;
        }
      }
      xml += hasChild ? ">" : "/>";
      if (hasChild) {
        for (const m2 in v) {
          if (m2 === "#text") xml += v[m2];
          else if (m2 === "#cdata") xml += "<![CDATA[" + v[m2] + "]]>";
          else if (m2.charAt(0) !== "@") xml += toXml(v[m2], m2, ind + "\t");
        }
        xml +=
          (xml.charAt(xml.length - 1) === "\n" ? ind : "") + "</" + name + ">";
      }
    } else {
      xml += ind + "<" + name + ">" + v.toString() + "</" + name + ">";
    }
    return xml;
  };
  let xml = "";
  for (const m3 in o) xml += toXml(o[m3], m3, "");
  return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
}

interface ResponseHeaderProps {
  description?: string;
  example?: string;
  schema?: {
    type?: string;
  };
}

export const ResponseHeaders: React.FC<{
  responseHeaders?: Record<string, ResponseHeaderProps>;
}> = ({ responseHeaders }) => {
  if (!responseHeaders) {
    return null;
  }

  return (
    <ul style={{ marginLeft: "1rem" }}>
      {Object.entries(responseHeaders).map(([headerName, headerObj]) => {
        const { description, example, schema } = headerObj;
        const type = schema?.type ?? "any";

        return (
          <li className="schemaItem" key={headerName}>
            <details>
              <summary>
                <strong>{headerName}</strong>
                {type && <span style={{ opacity: "0.6" }}> {type}</span>}
              </summary>
              <div>
                {description && (
                  <div style={{ marginTop: ".5rem", marginBottom: ".5rem" }}>
                    {example && `Example: ${example}`}
                    {createDescription(description)}
                  </div>
                )}
              </div>
            </details>
          </li>
        );
      })}
    </ul>
  );
};

interface ResponseExamplesProps {
  responseExamples: any;
  mimeType: string;
}
export const ResponseExamples: React.FC<ResponseExamplesProps> = ({
  responseExamples,
  mimeType,
}): any => {
  let language = "shell";
  if (mimeType.endsWith("json")) language = "json";
  if (mimeType.endsWith("xml")) language = "xml";

  // Map response examples to an array of TabItem elements
  const examplesArray = Object.entries(responseExamples).map(
    ([exampleName, exampleValue]: any) => {
      const isObject = typeof exampleValue.value === "object";
      const responseExample = isObject
        ? JSON.stringify(exampleValue.value, null, 2)
        : exampleValue.value;

      return (
        // @ts-ignore
        <TabItem label={exampleName} value={exampleName} key={exampleName}>
          {exampleValue.summary && (
            <div className="openapi-example__summary">
              {exampleValue.summary}
            </div>
          )}
          <ResponseSamples
            responseExample={responseExample}
            language={language}
          />
        </TabItem>
      );
    }
  );

  return examplesArray;
};

interface ResponseExampleProps {
  responseExample: any;
  mimeType: string;
}

export const ResponseExample: React.FC<ResponseExampleProps> = ({
  responseExample,
  mimeType,
}) => {
  let language = "shell";
  if (mimeType.endsWith("json")) {
    language = "json";
  }
  if (mimeType.endsWith("xml")) {
    language = "xml";
  }

  const isObject = typeof responseExample === "object";
  const exampleContent = isObject
    ? JSON.stringify(responseExample, null, 2)
    : responseExample;

  return (
    // @ts-ignore
    <TabItem label="Example" value="Example">
      {responseExample.summary && (
        <div className="openapi-example__summary">
          {responseExample.summary}
        </div>
      )}
      <ResponseSamples responseExample={exampleContent} language={language} />
    </TabItem>
  );
};

interface ExampleFromSchemaProps {
  schema: any;
  mimeType: string;
}

export const ExampleFromSchema: React.FC<ExampleFromSchemaProps> = ({
  schema,
  mimeType,
}) => {
  const responseExample = sampleResponseFromSchema(schema);

  if (mimeType.endsWith("xml")) {
    let responseExampleObject;
    try {
      responseExampleObject = JSON.parse(JSON.stringify(responseExample));
    } catch {
      return null;
    }

    if (typeof responseExampleObject === "object") {
      let xmlExample;
      try {
        xmlExample = format(json2xml(responseExampleObject, ""), {
          indentation: "  ",
          lineSeparator: "\n",
          collapseContent: true,
        });
      } catch {
        const xmlExampleWithRoot = { root: responseExampleObject };
        try {
          xmlExample = format(json2xml(xmlExampleWithRoot, ""), {
            indentation: "  ",
            lineSeparator: "\n",
            collapseContent: true,
          });
        } catch {
          xmlExample = json2xml(responseExampleObject, "");
        }
      }
      return (
        // @ts-ignore
        <TabItem label="Example (auto)" value="Example (auto)">
          <ResponseSamples responseExample={xmlExample} language="xml" />
        </TabItem>
      );
    }
  }

  if (
    typeof responseExample === "object" ||
    typeof responseExample === "string"
  ) {
    return (
      // @ts-ignore
      <TabItem label="Example (auto)" value="Example (auto)">
        <ResponseSamples
          responseExample={JSON.stringify(responseExample, null, 2)}
          language="json"
        />
      </TabItem>
    );
  }

  return null;
};
