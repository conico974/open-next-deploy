import { createServer } from "node:http";

import { StreamCreator } from "open-next/http/openNextResponse.js";
import type { WrapperHandler } from "open-next/types/open-next.js";

const wrapper: WrapperHandler = async (handler, converter) => {
  const server = createServer(async (req, res) => {
    const internalEvent = await converter.convertFrom(req);
    const _res: StreamCreator = {
      writeHeaders: (prelude) => {
        res.setHeader("Set-Cookie", prelude.cookies);
        delete prelude.headers["set-cookie"];
        res.writeHead(prelude.statusCode, prelude.headers);
        res.flushHeaders();
        res.uncork();
        return res;
      },
      onFinish: () => {
        // Is it necessary to do something here?
      },
    };
    if (internalEvent.rawPath === "/__health") {
      res.writeHead(200, {
        "Content-Type": "text/plain",
      });
      res.end("OK");
    } else {
      await handler(internalEvent, _res);
    }
  });

  await new Promise<void>((resolve) => {
    server.on("listening", () => {
      const cleanup = (code: number) => {
        console.debug(`Closing server`);
        server.close(() => {
          console.debug(`Server closed`);
          process.exit(code);
        });
      };
      console.log(`Listening on port ${process.env.PORT ?? "3000"}`);
      console.debug(`Open Next version: ${process.env.OPEN_NEXT_VERSION}`);

      process.on("exit", (code) => cleanup(code));

      process.on("SIGINT", () => cleanup(0));
      process.on("SIGTERM", () => cleanup(0));

      resolve();
    });

    server.listen(parseInt(process.env.PORT ?? "3000", 10));
  });

  server.on("error", (err) => {
    console.error(err);
  });

  return () => {
    server.close();
  };
};

export default {
  wrapper,
  name: "node",
  supportStreaming: true,
};
