import type { Group, Link, InsertGroup, InsertLink } from "@shared/schema";

// Groups
export async function fetchGroups(): Promise<Group[]> {
  const res = await fetch("/api/groups");
  if (!res.ok) throw new Error("Failed to fetch groups");
  return res.json();
}

export async function createGroup(data: InsertGroup): Promise<Group> {
  const res = await fetch("/api/groups", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create group");
  return res.json();
}

export async function deleteGroup(id: string): Promise<void> {
  const res = await fetch(`/api/groups/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete group");
}

// Links
export async function fetchLinks(): Promise<Link[]> {
  const res = await fetch("/api/links");
  if (!res.ok) throw new Error("Failed to fetch links");
  return res.json();
}

export async function createLink(data: InsertLink): Promise<Link> {
  const res = await fetch("/api/links", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create link");
  return res.json();
}

export async function deleteLink(id: string): Promise<void> {
  const res = await fetch(`/api/links/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete link");
}
