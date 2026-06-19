import { db } from "../../../database/client";

export class AuthRepository {
  async findByUsername(
    username: string
  ) {
    const { data, error } = await db
      .from("users")
      .select("*")
      .eq("username", username)
      .single();

    if (error) {
      return null;
    }

    return data;
  }
}