import { useEffect, useState } from 'react';
import { PollutionType } from 'models'
import { supabase } from 'services';

export default function usePollution(division_id: string) {
   const [pollutionTypes, setData] = useState<PollutionType[] | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<Error | null>(null);

   useEffect(() => {
    if (!division_id) return;
     const fetchData = async () => {
      setIsLoading(true);
       try {
        const { data, error } = await supabase.functions.invoke(
          "fetch-pollutions",
          { body: { division_id:  division_id  } }
        );
        if (error) throw error;
        setData(data as PollutionType[])
       } catch (err){
        setError(err as Error)
       } finally{
        setIsLoading(false)
       }
     };

     fetchData();
   }, [division_id]);

   return {
     pollutionTypes,
     isLoading,
     error,
   };
};