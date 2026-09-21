export interface CreateUserInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

// Dates arrive as ISO strings: JSON has no Date type.
export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  verifiedAt: string | null;
  createdAt: string;
}

export interface Credentials {
  email: string;
  password: string;
}
