type BookPreview = {
    id: string;
    title: string;
    price: number;
    thumbnail: { url: string };
    createdAt: string;
    updatedAt: string;
};

type BookType = BookPreview & {
    content: string;
};

type User = {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

type Purchase = {
    id: string;
    bookId: string;
    createdAt: string;
};

export type { BookPreview, BookType, User, Purchase };
