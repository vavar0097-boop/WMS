import bcrypt from "bcryptjs";

import { db } from "../src/database/client";

async function main() {

const passwordHash =
await bcrypt.hash(
"admin123",
10
);

const { data, error } =
await db
.from("users")
.upsert({
username: "admin",
full_name: "System Administrator",
password_hash: passwordHash,
is_active: true,
is_deleted: false,
deleted_at: null,
}, {
onConflict: "username",
})
.select("id, username")
.single();

if (error) {
console.error(error);
process.exit(1);
}

const { data: role, error: roleError } =
await db
.from("roles")
.select("id")
.eq("name", "ADMIN")
.maybeSingle();

if (roleError) {
console.error(roleError);
process.exit(1);
}

if (role) {
const { error: userRoleError } =
await db
.from("user_roles")
.upsert({
user_id: data.id,
role_id: role.id,
}, {
onConflict: "user_id,role_id",
})
;

if (userRoleError) {
console.error(userRoleError);
process.exit(1);
}
}

console.log(
"Admin ready:",
data
);

process.exit(0);
}

main();
