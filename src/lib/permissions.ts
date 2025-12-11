import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  organization: ["create", "share", "update", "delete"],
  project: ["create", "share", "update", "delete"],
  stripe: ["create", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const owner = ac.newRole({
  ...adminAc.statements,
});

export const liason = ac.newRole({
  project: ["create", "update"],
});

export const admin = ac.newRole({
  project: ["create", "update"],
});
