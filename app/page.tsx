"use client";

import React from "react";
import Layout from "../components/layout/Layout";
import Card from "../components/surfaces/Card";
import Table, { type Column } from "../components/data/Table";
import Badge from "../components/ui/Badge";
import LoginForm from "../components/form/LoginForm";

type Person = {
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Active" | "Invited" | "Suspended";
};

const data: Person[] = [
  { name: "Alice Johnson", email: "alice@example.com", role: "Admin",  status: "Active" },
  { name: "Bob Smith",     email: "bob@example.com",   role: "Editor", status: "Invited" },
  { name: "Carol Lee",     email: "carol@example.com", role: "Viewer", status: "Suspended" },
  { name: "David Kim",     email: "david@example.com", role: "Editor", status: "Active" },
  { name: "Eve Torres",    email: "eve@example.com",   role: "Viewer", status: "Active" },
  { name: "Frank Wang",    email: "frank@example.com", role: "Admin",  status: "Invited" },
  { name: "Grace Liu",     email: "grace@example.com", role: "Editor", status: "Active" },
  { name: "Henry Zhao",    email: "henry@example.com", role: "Viewer", status: "Active" },
];

const columns: Array<Column<Person>> = [
  { key: "name", header: "Name", sortable: true },
  { key: "email", header: "Email" },
  { key: "role", header: "Role", sortable: true },
  {
    key: "status",
    header: "Status",
    accessor: (row) => {
      const variant =
        row.status === "Active"
          ? "success"
          : row.status === "Invited"
          ? "info"
          : "warning";
      return <Badge variant={variant as any}>{row.status}</Badge>;
    },
  },
];

export default function HomePage() {
  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
        <div className="lg:col-span-2">
          <Card
            title="Team members"
            description="A reusable table with sorting and optional pagination."
          >
            <Table<Person>
              columns={columns}
              data={data}
              initialSort={{ key: "name", direction: "asc" }}
              pagination
              defaultPageSize={5}
            />
          </Card>
        </div>
      </div>
    </Layout>
  );
}
