interface Env {
	PORT: string;
	ENVIRONMENT: string;
	DATABASE_URL: string;
	JWT_SECRET: string;
	JWT_ALGORITHM: string;
	ACCESS_TOKEN_EXPIRE_DAYS: string;
	ADMIN_USERNAME: string;
	ADMIN_PASSWORD: string;
	RESEND_API_KEY: string;
	CLOUDINARY_CLOUD_NAME: string;
	CLOUDINARY_API_KEY: string;
	CLOUDINARY_API_SECRET: string;
	ALLOWED_ORIGINS: string;
	SITE_URL: string;
}
