// Central query key factory — avoids magic strings across the app
export const queryKeys = {
  // Meals
  meals: {
    all: ["meals"] as const,
    list: (params?: Record<string, unknown>) => ["meals", "list", params] as const,
    cost: () => ["meals", "cost"] as const,
  },
  // Members
  members: {
    all: ["members"] as const,
    list: (includeInactive = false) => ["members", "list", { includeInactive }] as const,
  },
  // Months
  months: {
    active: () => ["months", "active"] as const,
    history: (limit: number, offset: number) => ["months", "history", { limit, offset }] as const,
    detail: (id: string) => ["months", id] as const,
  },
  // Expenses
  expenses: {
    mealExpenses: (monthId?: string) => ["expenses", "meals", monthId] as const,
    homeRent: (monthId?: string) => ["expenses", "home-rent", monthId] as const,
    utilities: (monthId?: string) => ["expenses", "utilities", monthId] as const,
    summaryByMembers: (monthId?: string) => ["expenses", "summary", "members", monthId] as const,
    summaryTotals: (monthId?: string) => ["expenses", "summary", "totals", monthId] as const,
  },
  // Deposits
  deposits: {
    list: (params?: Record<string, unknown>) => ["deposits", "list", params] as const,
  },
  // Tickets
  tickets: {
    all: ["tickets"] as const,
    detail: (id: string) => ["tickets", "detail", id] as const,
  },
  // Admin
  admin: {
    stats: {
      overview: () => ["admin", "stats", "overview"] as const,
      activity: (limit: number) => ["admin", "stats", "activity", { limit }] as const,
    },
    messes: {
      all: ["admin", "messes"] as const,
      list: (params?: Record<string, unknown>) => ["admin", "messes", "list", params] as const,
      detail: (id: string) => ["admin", "messes", id] as const,
    },
    managers: {
      all: ["admin", "managers"] as const,
      list: (params?: Record<string, unknown>) => ["admin", "managers", "list", params] as const,
      detail: (id: string) => ["admin", "managers", id] as const,
    },
    users: {
      all: ["admin", "users"] as const,
      list: (params?: Record<string, unknown>) => ["admin", "users", "list", params] as const,
    },
    tickets: {
      all: ["admin", "tickets"] as const,
      list: (params?: Record<string, unknown>) => ["admin", "tickets", "list", params] as const,
      detail: (id: string) => ["admin", "tickets", id] as const,
    },
    packages: {
      all: ["admin", "packages"] as const,
      list: () => ["admin", "packages", "list"] as const,
    },
    audit: {
      all: ["admin", "audit"] as const,
      list: (params?: Record<string, unknown>) => ["admin", "audit", "list", params] as const,
    },
  },
};
