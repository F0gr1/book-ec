import "server-only";

export const getAppUrl = () => {
    const value = process.env.APP_URL ?? process.env.NEXTAUTH_URL;

    if (!value) {
        throw new Error("APP_URL is not configured");
    }

    const url = new URL(value);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("APP_URL must use HTTP or HTTPS");
    }

    return url.origin;
};
