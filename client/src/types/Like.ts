export interface Like {
  _id: string;
  user: {
    _id: string;
  };
  post: string;
  createdAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    username: string;
  };
  post: string;
  createdAt: string;
}
