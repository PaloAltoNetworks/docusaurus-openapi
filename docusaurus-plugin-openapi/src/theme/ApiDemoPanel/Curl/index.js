import React, { useRef, useState, useEffect } from "react";
import Highlight, { defaultProps } from "prism-react-renderer";
import codegen from "postman-code-generators";
import { useSelector } from "react-redux";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import usePrismTheme from "@theme/hooks/usePrismTheme";

import FloatingButton from "./../FloatingButton";
import buildPostmanRequest from "./../buildPostmanRequest";

import styles from "./styles.module.css";

const languageSet = [
  {
    tabName: "cURL",
    highlight: "bash",
    language: "curl",
    variant: "curl",
    options: {
      longFormat: false,
      followRedirect: true,
      trimRequestBody: true,
    },
  },
  {
    tabName: "Node",
    highlight: "javascript",
    language: "nodejs",
    variant: "axios",
    options: {
      ES6_enabled: true,
      followRedirect: true,
      trimRequestBody: true,
    },
  },
  {
    tabName: "Go",
    highlight: "go",
    language: "go",
    variant: "native",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
  },
  {
    tabName: "Python",
    highlight: "python",
    language: "python",
    variant: "requests",
    options: {
      followRedirect: true,
      trimRequestBody: true,
    },
  },
];

const languageTheme = {
  plain: {
    color: "var(--ifm-code-color)",
  },
  styles: [
    {
      types: ["inserted", "attr-name"],
      style: {
        color: "var(--openapi-code-green)",
      },
    },
    {
      types: ["string", "url"],
      style: {
        color: "var(--openapi-code-green)",
      },
    },
    {
      types: ["builtin", "char", "constant", "function"],
      style: {
        color: "var(--openapi-code-blue)",
      },
    },
    {
      types: ["punctuation", "operator"],
      style: {
        color: "#7f7f7f",
      },
    },
    {
      types: ["class-name"],
      style: {
        color: "var(--openapi-code-orange)",
      },
    },
    {
      types: ["tag", "arrow", "keyword"],
      style: {
        color: "#d9a0f9",
      },
    },
    {
      types: ["boolean"],
      style: {
        color: "var(--openapi-code-red)",
      },
    },
  ],
};

function Curl() {
  // TODO: match theme for vscode.
  const prismTheme = usePrismTheme();

  const { siteConfig } = useDocusaurusContext();

  const langs = siteConfig?.themeConfig?.languageTabs || languageSet;

  const [language, setLanguage] = useState(langs[0]);

  const [copyText, setCopyText] = useState("Copy");

  const pathParams = useSelector((state) => state.params.path);
  const queryParams = useSelector((state) => state.params.query);
  const cookieParams = useSelector((state) => state.params.cookie);
  const headerParams = useSelector((state) => state.params.header);
  const contentType = useSelector((state) => state.contentType);
  const body = useSelector((state) => state.body);
  const accept = useSelector((state) => state.accept);
  const endpoint = useSelector((state) => state.endpoint);
  const postman = useSelector((state) => state.postman);

  const [codeText, setCodeText] = useState("");

  useEffect(() => {
    if (language) {
      const postmanRequest = buildPostmanRequest(postman, {
        queryParams,
        pathParams,
        cookieParams,
        contentType,
        accept,
        headerParams,
        body,
        endpoint,
      });

      codegen.convert(
        language.language,
        language.variant,
        postmanRequest,
        language.options,
        (error, snippet) => {
          if (error) {
            return;
          }
          setCodeText(snippet);
        }
      );
    }
  }, [
    accept,
    body,
    contentType,
    cookieParams,
    headerParams,
    language,
    pathParams,
    postman,
    queryParams,
    endpoint,
  ]);

  const ref = useRef(null);

  const handleCurlCopy = () => {
    setCopyText("Copied");
    setTimeout(() => {
      setCopyText("Copy");
    }, 2000);
    navigator.clipboard.writeText(ref.current.innerText);
  };

  if (language === undefined) {
    return null;
  }

  return (
    <>
      <div className={styles.buttonGroup}>
        {langs.map((lang) => {
          return (
            <button
              className={language === lang ? styles.selected : undefined}
              onClick={() => setLanguage(lang)}
            >
              {lang.tabName}
            </button>
          );
        })}
      </div>

      <Highlight
        {...defaultProps}
        theme={languageTheme}
        code={codeText}
        language={language.highlight}
      >
        {({ className, tokens, getLineProps, getTokenProps }) => (
          <FloatingButton onClick={handleCurlCopy} label={copyText}>
            <pre
              className={className}
              style={{
                background: "var(--openapi-card-background-color)",
                paddingRight: "60px",
                borderRadius:
                  "2px 2px var(--openapi-card-border-radius) var(--openapi-card-border-radius)",
              }}
            >
              <code ref={ref}>
                {tokens.map((line, i) => (
                  <span {...getLineProps({ line, key: i })}>
                    {line.map((token, key) => {
                      if (token.types.includes("arrow")) {
                        token.types = ["arrow"];
                      }
                      return <span {...getTokenProps({ token, key })} />;
                    })}
                    {"\n"}
                  </span>
                ))}
              </code>
            </pre>
          </FloatingButton>
        )}
      </Highlight>
    </>
  );
}

export default Curl;
