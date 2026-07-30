import "server-only";

import { createClient } from "microcms-js-sdk";
import { BookPreview, BookType } from "@/app/types/type";

const endpoint = "bookec";
const previewFields = "id,title,price,thumbnail,createdAt,updatedAt";

const getClient = () => {
    const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN;
    const apiKey = process.env.MICROCMS_API_KEY;

    if (!serviceDomain || !apiKey) {
        throw new Error("microCMS is not configured");
    }

    return createClient({ serviceDomain, apiKey });
};

export const getAllBooks = async () =>
    getClient().getList<BookPreview>({
        endpoint,
        queries: { fields: previewFields },
    });

export const getBookPreview = async (contentId: string) =>
    getClient().getListDetail<BookPreview>({
        endpoint,
        contentId,
        queries: { fields: previewFields },
    });

export const getBookContent = async (contentId: string) =>
    getClient().getListDetail<BookType>({
        endpoint,
        contentId,
        queries: {
            fields: `${previewFields},content`,
        },
    });
