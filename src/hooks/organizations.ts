import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as orgsApi from "../api/organizations";
import type { OrganizationCreateInput } from "../types";

export function useMyOrganizations(enabled = true) {
  return useQuery({
    queryKey: ["organizations", "mine"],
    queryFn: orgsApi.listMine,
    enabled,
  });
}

export function useAdminOrganizations(enabled = false) {
  return useQuery({
    queryKey: ["organizations", "admin"],
    queryFn: orgsApi.listAll,
    enabled,
  });
}

export function useOrganizationMembers(organizationId: string | null, enabled = false) {
  return useQuery({
    queryKey: ["organizations", "members", organizationId],
    queryFn: () => orgsApi.listMembers(organizationId!),
    enabled: enabled && Boolean(organizationId),
  });
}

export function useJoinOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => orgsApi.joinOrganization(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] });
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OrganizationCreateInput) => orgsApi.createOrganization(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}
