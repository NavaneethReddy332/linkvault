import type { Group, Link } from "@shared/schema";

// Auth
export async function getGoogleAuthUrl(): Promise<string> {
  const res = await fetch("/api/auth/google");
  if (!res.ok) throw new Error("Failed to get auth URL");
  const data = await res.json();
  return data.url;
}

export async function getCurrentUser(): Promise<{ id: string; name: string; email: string; avatar: string | null; createdAt: Date } | null> {
  const res = await fetch("/api/auth/me");
  if (!res.ok) throw new Error("Failed to fetch user");
  const data = await res.json();
  return data.user;
}

export async function logout(): Promise<void> {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  if (!res.ok) throw new Error("Failed to logout");
}

// Account
export async function getAccountStats(): Promise<{ linkCount: number; joinedAt: Date }> {
  const res = await fetch("/api/account/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function deleteAllLinks(confirmation: string): Promise<void> {
  const res = await fetch("/api/account/delete-all-links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirmation }),
  });
  if (!res.ok) throw new Error("Failed to delete links");
}

export async function deleteAccount(confirmation: string): Promise<void> {
  const res = await fetch("/api/account/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ confirmation }),
  });
  if (!res.ok) throw new Error("Failed to delete account");
}

// Groups
export async function fetchGroups(): Promise<Group[]> {
  const res = await fetch("/api/groups");
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error("Failed to fetch groups");
  }
  return res.json();
}

export async function createGroup(data: { name: string; order: number }): Promise<Group> {
  const res = await fetch("/api/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create group");
  return res.json();
}

export async function deleteGroup(id: string): Promise<void> {
  const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete group");
}

// Links
export async function fetchLinks(): Promise<Link[]> {
  const res = await fetch("/api/links");
  if (!res.ok) {
    if (res.status === 401) return [];
    throw new Error("Failed to fetch links");
  }
  return res.json();
}

export async function createLink(data: { url: string; title: string; groupId: string; note?: string }): Promise<Link> {
  const res = await fetch("/api/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create link");
  return res.json();
}

export async function deleteLink(id: string): Promise<void> {
  const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete link");
}

export async function toggleLinkPin(id: string, isPinned: boolean): Promise<Link> {
  const res = await fetch(`/api/links/${id}/pin`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isPinned }),
  });
  if (!res.ok) throw new Error("Failed to toggle pin");
  return res.json();
}
