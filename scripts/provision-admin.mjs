import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.ADMIN_EMAIL ?? "openclawid6@gmail.com")
  .trim()
  .toLowerCase();
const password = process.env.ADMIN_INITIAL_PASSWORD;

if (!url || !serviceRoleKey) {
  throw new Error(
    "Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY first.",
  );
}
if (!password || password.length < 12) {
  throw new Error("Set ADMIN_INITIAL_PASSWORD to at least 12 characters.");
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let existingUser;
for (let page = 1; page <= 20 && !existingUser; page += 1) {
  const { data, error } = await supabase.auth.admin.listUsers({
    page,
    perPage: 100,
  });
  if (error) throw error;
  existingUser = data.users.find(
    (user) => user.email?.toLowerCase() === email,
  );
  if (data.users.length < 100) break;
}

if (existingUser) {
  const { error } = await supabase.auth.admin.updateUserById(existingUser.id, {
    password,
    email_confirm: true,
  });
  if (error) throw error;
  console.log(`Updated the admin account for ${email}.`);
} else {
  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  console.log(`Created the admin account for ${email}.`);
}
