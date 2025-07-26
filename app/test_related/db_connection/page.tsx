"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface User {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

export default function TestUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .limit(10);
      if (error) {
        setError(error.message);
      } else {
        setUsers(data || []);
      }
    };

    fetchUsers();
  }, []);

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Users (Test Supabase Connection)
      </h1>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.user_id} className="border p-2 rounded">
              <strong>
                {user.first_name} {user.last_name}
              </strong>{" "}
              <br />
              Email: {user.email} <br />
              Phone: {user.phone_number}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
