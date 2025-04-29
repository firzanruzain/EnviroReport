import { useState, useEffect } from "react";
import { User, UserModel, Profile } from "models-core";

type UserFetcher<T = User | User[] | Profile> = () => Promise<T>;

export default function useUser<T = User | User[] | Profile>(
  fetcher: UserFetcher<T>,
  options?: {
    enabled?: boolean; // Optional flag to conditionally run the query
  }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options?.enabled === false) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const result = await fetcher();
        setData(result);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [fetcher, options?.enabled]);

  return {
    data,
    isLoading,
    error,
    refetch: () => fetcher().then(setData),
  };
}
