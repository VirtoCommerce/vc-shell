/**
 * Example configuration for changelog generation
 * Copy this file and adjust the packages array to match your project structure
 */

export default {
  // Array of packages to generate changelogs for
  packages: [
    {
      name: "framework",
      path: "framework",
      displayName: "Framework (@vc-shell/framework)"
    },
    {
      name: "cli/api-client",
      path: "cli/api-client",
      displayName: "API Client Generator (@vc-shell/api-client-generator)"
    },
    // Add more packages as needed...
  ],

  // Optional: Root directory (defaults to process.cwd())
  rootDir: process.cwd(),

  // Optional: Generate consolidated root changelog (defaults to true)
  generateRoot: true,

  // Optional: Include header in root changelog (defaults to true)
  includeRootHeader: true,
};
