import type { FastifyInstance } from "fastify";
import { pingDatabase } from "../config/db.js";
import { env } from "../config/env.js";

export const registerHealthRoutes = async (app: FastifyInstance) => {
  app.get("/", async (_req, reply) => {
    const adminLink = env.ADMIN_PORTAL_ENABLED
      ? '<li><a href="/admin">Admin portal</a></li>'
      : "";

    reply.type("text/html").send(`
      <html>
        <body style="font-family: Inter, Arial, sans-serif; padding: 32px;">
          <h1>Onboard Backend</h1>
          <p>Service is running.</p>
          <ul>
            <li><a href="/portal">Applicant portal</a></li>
            ${adminLink}
            <li><a href="/health">Health JSON</a></li>
          </ul>
        </body>
      </html>
    `);
  });

  app.get("/health", async (_req, reply) => {
    const database = await pingDatabase();

    if (!database.ok) {
      reply.status(503);
    }

    return {
      ok: database.ok,
      service: "onboard-backend",
      timestamp: new Date().toISOString(),
      database,
    };
  });
};
