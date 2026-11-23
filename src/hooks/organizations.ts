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

export function useCreateOrganization() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: OrganizationCreateInput) => orgsApi.createOrganization(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}
