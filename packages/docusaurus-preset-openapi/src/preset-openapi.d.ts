/* ============================================================================
 * Copyright (c) Cloud Annotations
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import type {
  Options as ClassicOptions,
  ThemeConfig as ClassicThemeConfig,
} from "@docusaurus/preset-classic";

export type Options = {
  api?: false | import("@paloaltonetworks/docusaurus-plugin-openapi").Options;
  proxy?: false | import("@paloaltonetworks/docusaurus-plugin-proxy").Options;
} & ClassicOptions;

export type ThemeConfig =
  import("@paloaltonetworks/docusaurus-theme-openapi").ThemeConfig &
    ClassicThemeConfig;
