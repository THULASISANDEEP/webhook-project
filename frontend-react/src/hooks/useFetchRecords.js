import { useEffect, useState } from "react";
import { API_BASE_URL } from "../constants/uiConstants";

/**
 * Fetch records from the backend.
 *
 * @param {Object}   options
 * @param {string}   [options.stageFilter]  — when set, only records with this stage are kept
 * @returns {{ data: Object[], loading: boolean, error: string|null, refetch: Function }}
 */
export default function useFetchRecords({ stageFilter } = {}) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API_BASE_URL}/records`);
      const json = await res.json();
      const records = json.data || [];
      setData(stageFilter ? records.filter((r) => r.stage === stageFilter) : records);
    } catch (err) {
      setError(err.message || "Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: fetchData };
}
