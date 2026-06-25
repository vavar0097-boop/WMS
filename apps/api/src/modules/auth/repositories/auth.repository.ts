import { db } from "../../../database/client";

export class AuthRepository {
  async findByUsername(
    username: string
  ) {
    const { data, error } = await db
      .from("users")
      .select(`
        id,
        username,
        full_name,
        password_hash,
        is_active,
        is_deleted,
        user_roles (
          roles (
            name
          )
        )
      `)
      .eq("username", username.trim())
      .eq("is_active", true)
      .eq("is_deleted", false)
      .single();

    if (error) {
      return null;
    }

    return data;
  }
}
