import { api } from "./client";
import type { Organization, OrganizationCreateInput } from "../types";

export async function listMine(): Promise<Organization[]> {
  const { data } = await api.get<Organization[]>("/organizations/mine");
  return data;
}

export async function createOrganization(input: OrganizationCreateInput): Promise<Organization> {
  const { data } = await api.post<Organization>("/organizations/", input);
  return data;
}
