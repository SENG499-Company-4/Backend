import { makeSchema } from "nexus";
import { join } from "path";

export const schema = makeSchema({
  types: [],
  outputs: {
    typegen: join(
      __dirname,
      "..",
      "node_modules",
      "@types",
      "nexus-typegen",
      "index.d.ts"
    ),
    schema: join(__dirname, "..", "schema.graphql"),
  },
});
