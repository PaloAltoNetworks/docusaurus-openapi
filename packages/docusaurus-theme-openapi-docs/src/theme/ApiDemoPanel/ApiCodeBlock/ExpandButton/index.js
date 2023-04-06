/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useEffect } from "react";

import { usePrismTheme } from "@docusaurus/theme-common";
import { translate } from "@docusaurus/Translate";
import Container from "@theme/ApiDemoPanel/ApiCodeBlock/Container";
import CopyButton from "@theme/ApiDemoPanel/ApiCodeBlock/CopyButton";
import ExitButton from "@theme/ApiDemoPanel/ApiCodeBlock/ExitButton";
import Line from "@theme/ApiDemoPanel/ApiCodeBlock/Line";
import WordWrapButton from "@theme/ApiDemoPanel/ApiCodeBlock/WordWrapButton";
import clsx from "clsx";
import Highlight, { defaultProps } from "prism-react-renderer";
import Modal from "react-modal";

import styles from "./styles.module.css";

export default function ExpandButton({
  code,
  className,
  language,
  showLineNumbers,
  blockClassName,
  title,
  lineClassNames,
  wordWrap,
}) {
  const prismTheme = usePrismTheme();

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  const [modalIsOpen, setIsOpen] = React.useState(false);

  const customStyles = {
    overlay: { backgroundColor: "rgba(0, 0, 0, 0.8)" },
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      padding: "none",
      borderRadius: "var(--ifm-global-radius)",
      transform: "translate(-50%, -50%)",
      maxWidth: "75%",
      overflow: "auto",
    },
  };
  useEffect(() => {
    Modal.setAppElement("body");
  });

  return (
    <>
      <button
        type="button"
        aria-label={
          modalIsOpen
            ? translate({
                id: "theme.CodeBlock.expanded",
                message: "Expanded",
                description: "The expanded button label on code blocks",
              })
            : translate({
                id: "theme.CodeBlock.expandButtonAriaLabel",
                message: "Expand code to fullscreen",
                description: "The ARIA label for expand code blocks button",
              })
        }
        title={translate({
          id: "theme.CodeBlock.expand",
          message: "Expand",
          description: "The expand button label on code blocks",
        })}
        className={clsx(
          "clean-btn",
          className,
          styles.expandButton,
          modalIsOpen && styles.expandButtonCopied
        )}
        onClick={openModal}
      >
        <span className={styles.expandButtonIcons} aria-hidden="true">
          <svg className={styles.expandButtonIcon} viewBox="0 0 448 512">
            <path d="M32 32C14.3 32 0 46.3 0 64v96c0 17.7 14.3 32 32 32s32-14.3 32-32V96h64c17.7 0 32-14.3 32-32s-14.3-32-32-32H32zM64 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7 14.3 32 32 32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H64V352zM320 32c-17.7 0-32 14.3-32 32s14.3 32 32 32h64v64c0 17.7 14.3 32 32 32s32-14.3 32-32V64c0-17.7-14.3-32-32-32H320zM448 352c0-17.7-14.3-32-32-32s-32 14.3-32 32v64H320c-17.7 0-32 14.3-32 32s14.3 32 32 32h96c17.7 0 32-14.3 32-32V352z" />
          </svg>
          <svg className={styles.expandButtonSuccessIcon} viewBox="0 0 24 24">
            <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
          </svg>
        </span>
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Code Snippet"
      >
        <Container
          as="div"
          className={clsx(
            styles.codeBlockContainer,
            language &&
              !blockClassName.includes(`language-${language}`) &&
              `language-${language}`
          )}
        >
          {title && <div className={styles.codeBlockTitle}>{title}</div>}
          <div className={styles.codeBlockContent}>
            <Highlight
              {...defaultProps}
              theme={prismTheme}
              code={code}
              language={language ?? "text"}
            >
              {({ className, tokens, getLineProps, getTokenProps }) => (
                <pre
                  /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
                  tabIndex={0}
                  ref={wordWrap.codeBlockRef}
                  className={clsx(
                    className,
                    styles.codeBlock,
                    "thin-scrollbar"
                  )}
                >
                  <code
                    className={clsx(
                      styles.codeBlockLines,
                      showLineNumbers && styles.codeBlockLinesWithNumbering
                    )}
                  >
                    {tokens.map((line, i) => (
                      <Line
                        key={i}
                        line={line}
                        getLineProps={getLineProps}
                        getTokenProps={getTokenProps}
                        classNames={lineClassNames[i]}
                        showLineNumbers={showLineNumbers}
                      />
                    ))}
                  </code>
                </pre>
              )}
            </Highlight>
            <div className={styles.buttonGroup}>
              {(wordWrap.isEnabled || wordWrap.isCodeScrollable) && (
                <WordWrapButton
                  className={styles.codeButton}
                  onClick={() => wordWrap.toggle()}
                  isEnabled={wordWrap.isEnabled}
                />
              )}
              <CopyButton className={styles.codeButton} code={code} />
              <ExitButton className={styles.codeButton} handler={closeModal} />
            </div>
          </div>
        </Container>
      </Modal>
    </>
  );
}