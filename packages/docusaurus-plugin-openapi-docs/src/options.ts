/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import { Joi } from "@docusaurus/utils-validation";

const sidebarOptions = Joi.object({
  groupPathsBy: Joi.string().valid("tag", "tagGroup"),
  categoryLinkSource: Joi.string().valid("tag", "info", "auto"),
  customProps: Joi.object(),
  sidebarCollapsible: Joi.boolean(),
  sidebarCollapsed: Joi.boolean(),
});

const markdownGenerators = Joi.object({
  createApiPageMD: Joi.function(),
  createInfoPageMD: Joi.function(),
  createTagPageMD: Joi.function(),
});

export const OptionsSchema = Joi.object({
  id: Joi.string().required(),
  docsPlugin: Joi.string(),
  docsPluginId: Joi.string().required(),
  config: Joi.object()
    .pattern(
      /^/,
      Joi.object({
        specPath: Joi.string().required(),
        proxy: Joi.string(),
        outputDir: Joi.string().required(),
        template: Joi.string(),
        downloadUrl: Joi.string(),
        hideSendButton: Joi.boolean(),
        showExtensions: Joi.boolean(),
        sidebarOptions: sidebarOptions,
        markdownGenerators: markdownGenerators,
        showSchemas: Joi.boolean(),
        version: Joi.string().when("versions", {
          is: Joi.exist(),
          then: Joi.required(),
        }),
        label: Joi.string().when("versions", {
          is: Joi.exist(),
          then: Joi.required(),
        }),
        baseUrl: Joi.string().when("versions", {
          is: Joi.exist(),
          then: Joi.required(),
        }),
        versions: Joi.object().pattern(
          /^/,
          Joi.object({
            specPath: Joi.string().required(),
            outputDir: Joi.string().required(),
            label: Joi.string().required(),
            baseUrl: Joi.string().required(),
          })
        ),
      })
    )
    .required(),
});
