/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import path from "path";

import type {
  CategoryIndexMatcher,
  CategoryIndexMatcherParam,
} from "@docusaurus/plugin-content-docs";
import {
  aliasedSitePath,
  parseMarkdownString,
  // getFolderContainingFile,
  normalizeUrl,
} from "@docusaurus/utils";
import fs from "fs-extra";

import { DocPageMetadata } from "../types";
import { validateDocFrontMatter } from "./docFrontmatter";
import getSlug from "./slug";
import { DocObject, DocMetadataBase } from "./types";
// import { getDocsDirPaths } from "./versions";

interface DocFiles {
  source: string;
  sourceDirName: string;
  data: DocObject;
}

// By convention, Docusaurus considers some docs are "indexes":
// - index.md
// - readme.md
// - <folder>/<folder>.md
//
// This function is the default implementation of this convention
//
// Those index docs produce a different behavior
// - Slugs do not end with a weird "/index" suffix
// - Auto-generated sidebar categories link to them as intro
export const isCategoryIndex: CategoryIndexMatcher = ({
  fileName,
  directories,
}): boolean => {
  const eligibleDocIndexNames = [
    "index",
    "readme",
    directories[0]?.toLowerCase(),
  ];
  return eligibleDocIndexNames.includes(fileName.toLowerCase());
};

/**
 * `guides/sidebar/autogenerated.md` ->
 *   `'autogenerated', '.md', ['sidebar', 'guides']`
 */
export function toCategoryIndexMatcherParam({
  source,
  sourceDirName,
}: Pick<
  DocMetadataBase,
  "source" | "sourceDirName"
>): CategoryIndexMatcherParam {
  // source + sourceDirName are always posix-style
  return {
    fileName: path.posix.parse(source).name,
    extension: path.posix.parse(source).ext,
    directories: sourceDirName.split(path.posix.sep).reverse(),
  };
}

export async function readDocFiles(
  beforeApiDocs: Array<string>,
  _options: {}
): Promise<DocFiles[]> {
  const sources = beforeApiDocs.map(async (source) => {
    const fullPath = path.join(source);
    const data = (await fs.readFile(fullPath, "utf-8")) as DocObject;
    return {
      source: fullPath, // This will be aliased in process.
      sourceDirName: path.dirname(source),
      data,
    };
  });
  return Promise.all(sources);
}

export async function processDocFiles(
  files: DocFiles[],
  options: {
    baseUrl: string;
    routeBasePath: string;
    siteDir: string;
  }
): Promise<DocPageMetadata[]> {
  const promises = files.map(async (file) => {
    const {
      frontMatter: unsafeFrontMatter,
      contentTitle,
      excerpt,
    } = parseMarkdownString(file.data as string);
    const frontMatter = validateDocFrontMatter(unsafeFrontMatter);
    const slug = "/" + frontMatter.id;
    const permalink = options.baseUrl + options.routeBasePath;
    return {
      type: "doc" as "doc", // TODO: fix this
      id: frontMatter.id ?? "",
      unversionedId: frontMatter.id ?? "",
      title: frontMatter.title ?? contentTitle ?? frontMatter.id ?? "",
      description: frontMatter.description ?? excerpt ?? "",
      slug: slug,
      frontMatter: frontMatter,
      permalink: permalink,
      ...file,
      source: aliasedSitePath(file.source, options.siteDir),
      sourceDirName: file.sourceDirName,
    };
  });
  const metadata = await Promise.all(promises);
  const items = metadata.flat();
  return items;
}
