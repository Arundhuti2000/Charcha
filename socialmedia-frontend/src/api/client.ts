import { tokenUtils } from "../utils/tokenUtils";
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const apiFetch = async (url: string, options?: RequestInit) => {
  const token = tokenUtils.get();

  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer  ${token}` }),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || `HTTP ${response.status}: ${response.statusText}`;
    return new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }

  return null;
};
