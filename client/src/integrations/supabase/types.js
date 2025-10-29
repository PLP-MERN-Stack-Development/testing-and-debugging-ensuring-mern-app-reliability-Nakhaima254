// MongoDB models and constants
export const BUG_PRIORITIES = ['low', 'medium', 'high', 'critical'];
export const BUG_SEVERITIES = ['low', 'medium', 'high', 'critical'];
export const BUG_STATUSES = ['open', 'in-progress', 'resolved', 'closed'];

export const Constants = {
  public: {
    Enums: {
      bug_priority: BUG_PRIORITIES,
      bug_severity: BUG_SEVERITIES,
      bug_status: BUG_STATUSES,
    },
  },
};
