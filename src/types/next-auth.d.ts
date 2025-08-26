import type { DefaultSession } from "next-auth";

declare module "next-auth" {
	interface User {
		id: string;
		role: "SUPER_ADMIN" | "TEACHER" | "STUDENT";
		locale: "en" | "es" | string;
		mustChangePassword?: boolean;
	}

	interface Session {
		user: {
			id: string;
			role: "SUPER_ADMIN" | "TEACHER" | "STUDENT";
			locale: "en" | "es" | string;
			mustChangePassword?: boolean;
		} & DefaultSession["user"]; // name, email, image
	}
}


