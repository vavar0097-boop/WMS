import bcrypt from "bcryptjs";

import { createClient } from "@supabase/supabase-js";

import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
process.env.SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {

const passwordHash =
await bcrypt.hash(
"admin123",
10
);

const { data, error } =
await supabase
.from("users")
.insert({
username: "admin",
full_name: "System Administrator",
password_hash: passwordHash,
})
.select()
.single();

if (error) {
console.error(error);
process.exit(1);
}

console.log(
"Admin created:",
data
);

process.exit(0);
}

main();
