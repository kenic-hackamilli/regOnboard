import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";

export const registerRateLimit = async (app: FastifyInstance) => {
  await app.register(rateLimit, {
    max: 120,
    timeWindow: "1 minute",
    allowList: [],
  });
};
