export enum Role {
  ADMIN = 'ADMIN',
  ANALYST = 'ANALYST',
  VIEWER = 'VIEWER',
}

export enum Status {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum RecordType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
