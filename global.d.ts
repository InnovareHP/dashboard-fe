declare global {
  interface Session {
    memberRole: string;
    activeOrganizationId: string;
  }
}
