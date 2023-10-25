"use client";
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { debounce } from "./utils";
import { PaginationNav1Presentation } from "./components/Pagination";

export default function Home() {
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const [percentage, setPercentage] = useState("0");

  const fetchData = (keyword: string, limit = 10, page = 1) => {

    const queryParameters: Record<string, string> = {
      limit: limit.toString(),
      page: page.toString(),
    };

    if (keyword) {
      queryParameters.keyword = keyword;
    }
    axios
      .get("http://localhost:3000/api/records", {
        params: queryParameters,
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        setRows(res.data?.results || []);
      });
  };

  useEffect(() => {
    fetchData(search, 10, 1);
  }, []);

  const debounceSearch = useCallback(
    debounce((value: string) => fetchData(value), 1000),
    []
  );

  const uploadCSV = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("http://localhost:3000/api/upload", formData, {
      onUploadProgress: (progressEvent: any) => {
        const percentage = (progressEvent.loaded / progressEvent.total) * 100;
        setPercentage(percentage.toFixed(2));
      },
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    setHeaders(res.data);
  };
  const handleFile = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setShowProgress(true);
    await uploadCSV(file);
    file.value = "";
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-14 min-w-fit">
      <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700 mb-4">
        {showProgress && (
          <div
            className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full w-44"
            style={{ width: `${percentage}%` }}
          >
            {percentage}%
          </div>
        )}
      </div>

      <div className="mb-4 w-full">
        <div className="relative float-left w-2/4">
          <input
            type="text"
            id="voice-search"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search"
            onInput={(e) => {
              setSearch(e.currentTarget.value);
            }}
            onChange={(e) => {
              // setSearch(e.currentTarget.value);
              debounceSearch(e.currentTarget.value);
            }}
            value={search || ""}
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center py-2.5 px-3 ml-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          onClick={() => fetchData(search)}
        >
          <svg
            className="w-4 h-4 mr-2"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
          Search
        </button>
        <input
          type="file"
          name="file-input"
          id="file-input"
          onInput={(e) => {
            setPercentage("0");
          }}
          onChange={handleFile}
          className="block border border-gray-200 shadow-sm rounded-md text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-900 dark:border-gray-700 dark:text-gray-400
file:bg-transparent file:border-0
file:bg-gray-100 file:mr-4
file:py-3 file:px-4
dark:file:bg-gray-700 dark:file:text-gray-400 float-right w-1/4"
        />
      </div>
      <div className="w-full relative">
        {rows.length > 0 && (
          <><table className="table-auto w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  id
                </th>
                <th scope="col" className="px-6 py-3">
                  postId
                </th>
                <th scope="col" className="px-6 py-3">
                  name
                </th>
                <th scope="col" className="px-6 py-3">
                  email
                </th>
                <th scope="col" className="px-6 py-3">
                  body
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length > 0 &&
                rows.map((row, index) => (
                  <UserData key={index} row={row} headers={headers} />
                ))}
            </tbody>
          </table><PaginationNav1Presentation fetchData={fetchData} search={search} /></>
        )}

      </div>
    </main>
  );
}

function UserData({
  row,
  headers,
}: {
  row: Record<string, string>;
  headers: string[];
}) {
  return (
    <tr>
      <td>{row.id}</td>
      <td>{row.postId}</td>
      <td>{row.name}</td>
      <td>{row.email}</td>
      <td>{row.body}</td>
    </tr>
  );
}
