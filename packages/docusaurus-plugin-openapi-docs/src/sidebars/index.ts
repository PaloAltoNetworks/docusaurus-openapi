/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import {
  ProcessedSidebar,
  SidebarItemCategoryLinkConfig,
  SidebarItemDoc,
} from "@docusaurus/plugin-content-docs/src/sidebars/types";
import clsx from "clsx";
import { kebabCase } from "lodash";
import uniq from "lodash/uniq";

import { TagObject } from "../openapi/types";
import type {
  SidebarOptions,
  APIOptions,
  ApiPageMetadata,
  ApiMetadata,
} from "../types";

function isApiItem(item: ApiMetadata): item is ApiMetadata {
  return item.type === "api";
}

function isInfoItem(item: ApiMetadata): item is ApiMetadata {
  return item.type === "info";
}

function groupByTags(
  items: ApiPageMetadata[],
  sidebarOptions: SidebarOptions,
  options: APIOptions,
  tags: TagObject[]
): ProcessedSidebar {
  const { outputDir } = options;
  const {
    sidebarCollapsed,
    sidebarCollapsible,
    customProps,
    categoryLinkSource,
  } = sidebarOptions;

  const apiItems = items.filter(isApiItem);
  const infoItems = items.filter(isInfoItem);
  const intros = infoItems.map((item: any) => {
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      tags: item.info.tags,
    };
  });

  // TODO: make sure we only take the first tag
  const apiTags = uniq(
    apiItems
      .flatMap((item) => item.api.tags)
      .filter((item): item is string => !!item)
  );

  // TODO: optimize this or make it a function
  const basePath = outputDir
    .slice(outputDir.indexOf("/", 1))
    .replace(/^\/+/g, "");

  function createDocItem(item: ApiPageMetadata): SidebarItemDoc {
    const sidebar_label = item.frontMatter.sidebar_label;
    const title = item.title;
    const id = item.id;
    return {
      type: "doc" as const,
      id: `${basePath}/${item.id}`,
      label: (sidebar_label as string) ?? title ?? id,
      customProps: customProps,
      className: clsx(
        {
          "menu__list-item--deprecated": item.api.deprecated,
          "api-method": !!item.api.method,
        },
        item.api.method
      ),
    };
  }

  let rootIntroDoc = undefined;
  if (infoItems.length === 1) {
    const infoItem = infoItems[0];
    const id = infoItem.id;
    rootIntroDoc = {
      type: "doc" as const,
      id: `${basePath}/${id}`,
    };
  }

  const tagged = apiTags
    .map((tag) => {
      // Map info object to tag
      const infoObject = intros.find((i) => i.tags.includes(tag));
      const tagObject = tags.flat().find(
        (t) =>
          (tag === t.name || tag === t["x-displayName"]) ?? {
            name: tag,
            description: `${tag} Index`,
          }
      );

      // TODO: perhaps move this into a getLinkConfig() function
      let linkConfig = undefined;
      if (infoObject !== undefined && categoryLinkSource === "info") {
        linkConfig = {
          type: "doc",
          id: `${basePath}/${infoObject.id}`,
        } as SidebarItemCategoryLinkConfig;
      }

      // TODO: perhaps move this into a getLinkConfig() function
      if (tagObject !== undefined && categoryLinkSource === "tag") {
        const linkDescription = tagObject?.description;
        linkConfig = {
          type: "generated-index" as "generated-index",
          title: tag,
          description: linkDescription,
          slug: "/category/" + kebabCase(tag),
        } as SidebarItemCategoryLinkConfig;
      }

      // Default behavior
      if (categoryLinkSource === undefined) {
        linkConfig = {
          type: "generated-index" as "generated-index",
          title: tag,
          slug: "/category/" + kebabCase(tag),
        } as SidebarItemCategoryLinkConfig;
      }

      return {
        type: "category" as const,
        label: tag,
        link: linkConfig,
        collapsible: sidebarCollapsible,
        collapsed: sidebarCollapsed,
        items: apiItems
          .filter((item) => !!item.api.tags?.includes(tag))
          .map(createDocItem),
      };
    })
    .filter((item) => item.items.length > 0); // Filter out any categories with no items.

  // TODO: determine how we want to handle these
  // const untagged = [
  //   {
  //     type: "category" as const,
  //     label: "UNTAGGED",
  //     collapsible: sidebarCollapsible,
  //     collapsed: sidebarCollapsed,
  //     items: apiItems
  //       .filter(({ api }) => api.tags === undefined || api.tags.length === 0)
  //       .map(createDocItem),
  //   },
  // ];

  // Shift root intro doc to top of sidebar
  // TODO: Add input validation for categoryLinkSource options
  if (rootIntroDoc && categoryLinkSource !== "info") {
    tagged.unshift(rootIntroDoc as any);
  }

  return [...tagged];
}

export default function generateSidebarSlice(
  sidebarOptions: SidebarOptions,
  options: APIOptions,
  api: ApiMetadata[],
  tags: TagObject[]
) {
  let sidebarSlice: ProcessedSidebar = [];
  if (sidebarOptions.groupPathsBy === "tags") {
    sidebarSlice = groupByTags(
      api as ApiPageMetadata[],
      sidebarOptions,
      options,
      tags
    );
  }
  return sidebarSlice;
}
