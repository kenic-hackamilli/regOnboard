import type { FastifyInstance } from "fastify";

export const registerHealthRoutes = async (app: FastifyInstance) => {
  app.get("/", async (_req, reply) => {
    reply.type("text/html").send(`
      <html>
        <body style="font-family: Inter, Arial, sans-serif; padding: 32px;">
          <h1>Onboard Backend</h1>
          <p>Service is running.</p>
          <ul>
            <li><a href="/portal">Applicant portal</a></li>
            <li><a href="/admin">Admin portal</a></li>
            <li><a href="/health">Health JSON</a></li>
          </ul>
        </body>
      </html>
    `);
  });

  app.get("/health", async () => ({
    ok: true,
    service: "onboard-backend",
    timestamp: new Date().toISOString(),
  }));
};
