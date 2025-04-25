import { useEffect, useState } from 'react';
import { PollutionType } from 'models-core'

type PollutionFetcher<T = PollutionType[]> = () => Promise<T>;

export default function usePollution<T = PollutionType[]>(fetcher: PollutionFetcher<T>) {
   const [data, setData] = useState<T | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<Error | null>(null);

   useEffect(() => {
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
   }, [fetcher]);

   return {
     data,
     isLoading,
     error,
     refetch: () => fetcher().then(setData),
   };
};