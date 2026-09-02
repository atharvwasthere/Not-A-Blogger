import { Container, getContainer } from "@cloudflare/containers";
import { Hono } from "hono";

export class MyContainer extends Container<Env> {
	// Port the container listens on (matches PORT in the app's env)
	defaultPort = 8000;
	// Time before container sleeps due to inactivity (default: 30s)
	sleepAfter = "2m";
	// Environment variables passed to the container
	envVars: Record<string, string>;

	constructor(ctx: Container<Env>["ctx"], env: Env) {
		super(ctx, env);
		this.envVars = {
			PORT: env.PORT,
			ENVIRONMENT: env.ENVIRONMENT,
			DATABASE_URL: env.DATABASE_URL,
			JWT_SECRET: env.JWT_SECRET,
			JWT_ALGORITHM: env.JWT_ALGORITHM,
			ACCESS_TOKEN_EXPIRE_DAYS: env.ACCESS_TOKEN_EXPIRE_DAYS,
			ADMIN_USERNAME: env.ADMIN_USERNAME,
			ADMIN_PASSWORD: env.ADMIN_PASSWORD,
			RESEND_API_KEY: env.RESEND_API_KEY,
			CLOUDINARY_CLOUD_NAME: env.CLOUDINARY_CLOUD_NAME,
			CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY,
			CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET,
			ALLOWED_ORIGINS: env.ALLOWED_ORIGINS,
			SITE_URL: env.SITE_URL,
		};
	}

	// Optional lifecycle hooks
	override onStart() {
		console.log("Container successfully started");
	}

	override onStop() {
		console.log("Container successfully shut down");
	}

	override onError(error: unknown) {
		console.log("Container error:", error);
	}
}

// Create Hono app with proper typing for Cloudflare Workers
const app = new Hono<{
	Bindings: Env;
}>();

// Cloudflare's Container SDK can proxy a request before the container's TCP
// port is actually listening (cloudflare/containers#139) — a brief window
// right after cold start/restart. Retry once for safe (GET/HEAD) requests.
async function isContainerNotListeningError(res: Response): Promise<boolean> {
	if (res.status !== 500) return false;
	const body = await res.clone().text();
	return body.includes("Error proxying request to container") || body.includes("not listening");
}

// Proxy every request to a single shared container instance
app.all("*", async (c) => {
	const container = getContainer(c.env.MY_CONTAINER);
	const res = await container.fetch(c.req.raw);

	const isRetriable = c.req.method === "GET" || c.req.method === "HEAD";
	if (isRetriable && (await isContainerNotListeningError(res))) {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return await container.fetch(c.req.raw);
	}

	return res;
});

export default app;
