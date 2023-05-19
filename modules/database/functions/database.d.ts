export function get(): database;
export function set(database: database): void;

type database = {
    communities: {
        [communityId: string]: community;
    };
};

type community = {
    posts: {
        [postId: string]: post;
    };
    id: string;
    name: string;
    owner: string;
};

type post = {
    votes: {
        [voteId: string]: vote;
    };
    id: string;
    owner: string;
    content: string;
    visibility: 'pending' | 'verified' | 'flagged' | 'hidden';
    visibilityAuthor: 'automatic' | 'manual';
    perspective: perspective;
};

type vote = {
    id: string;
    owner: string;
    isUpvote: boolean;
};

type perspective = {
    languages: string[];
    attributes: {
        IDENTITY_ATTACK: number,
        TOXICITY: number,
        INSULT: number,
        THREAT: number,
        PROFANITY: number,
        SEVERE_TOXICITY: number
    };
};