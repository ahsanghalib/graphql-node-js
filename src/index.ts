import fastify from "fastify";
import {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  Request,
  sendResult,
  shouldRenderGraphiQL,
} from "graphql-helix";
import "graphql-import-node";
import { schema } from "./schema";

async function main() {
  const server = fastify();

  server.get("/", (_, reply) => {
    reply.send({ test: true });
  });

  server.route({
    method: ["POST", "GET"],
    url: "/graphql",
    handler: async (req, reply) => {
      const request: Request = {
        headers: req.headers,
        method: req.method,
        query: req.query,
        body: req.body,
      };

      if (shouldRenderGraphiQL(request)) {
        reply.header("Content-Type", "text/html");
        reply.send(
          renderGraphiQL({
            endpoint: "/graphql",
          }),
        );

        return;
      }

      const { operationName, query, variables } = getGraphQLParameters(request);

      const result = await processRequest({
        request,
        schema,
        operationName,
        query,
        variables,
      });

      sendResult(result, reply.raw);
    },
  });

  server.listen({ port: 3000 }, (err, address) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }

    console.log(`Server listening at ${address}`);
  });
}

main();
