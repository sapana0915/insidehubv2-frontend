import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as usersApi from "../api/users";
import type { UserUpdateInput } from "../types";

export function useProfile(id: string | undefined) {
  return useQuery({
    queryKey: ["profile", id],
    queryFn: () => usersApi.getProfile(id!),
    enabled: Boolean(id),
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UserUpdateInput) => usersApi.updateMe(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
