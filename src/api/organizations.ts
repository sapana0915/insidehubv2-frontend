import { api } from "./client";
import type {
  Organization,
  OrganizationAdmin,
  OrganizationCreateInput,
  OrganizationMember,
} from "../types";

export async function listMine(): Promise<Organization[]> {
  const { data } = await api.get<Organization[]>("/organizations/mine");
  return data;
}

export async function listAll(): Promise<OrganizationAdmin[]> {
  const { data } = await api.get<OrganizationAdmin[]>("/organizations/");
  return data;
}

export async function listMembers(organizationId: string): Promise<OrganizationMember[]> {
  const { data } = await api.get<OrganizationMember[]>(`/organizations/${organizationId}/members`);
  return data;
}

export async function joinOrganization(): Promise<Organization> {
  const { data } = await api.post<Organization>("/organizations/join");
  return data;
}

export async function createOrganization(input: OrganizationCreateInput): Promise<Organization> {
  const { data } = await api.post<Organization>("/organizations/", input);
  return data;
}
