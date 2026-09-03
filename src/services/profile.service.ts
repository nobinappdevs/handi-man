import { privateApi } from "@/lib/axios";
import {
  updateProfileRequestSchema,
  updatePasswordRequestSchema,
  type UpdateProfileRequest,
  type UpdatePasswordRequest,
} from "@/schemas/profile.schema";

/** `/user/profile` also answers with the country list the form's select needs. */
export interface ProfileAddress {
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  address?: string;
}

export interface ProfileUser {
  id: number;
  firstname?: string;
  lastname?: string;
  fullname?: string;
  username?: string;
  email?: string;
  mobile?: string;
  mobile_code?: string;
  type?: string;
  userImage?: string;
  email_verified?: number | boolean;
  address?: ProfileAddress;
}

export interface ProfileData {
  user: ProfileUser;
  countries?: { name: string }[];
}

export const profileService = {
  /**
   * POST /user/profile/update — requires auth, sent as form-data.
   *
   * Empty strings are dropped rather than sent: the API treats a present-but-
   * blank optional field as "set this to blank", so posting the whole form
   * would wipe fields the user never touched.
   */
  async update(payload: UpdateProfileRequest) {
    const { image, ...body } = updateProfileRequestSchema.parse(payload);
    const form = new FormData();
    for (const [key, value] of Object.entries(body)) {
      if (value !== undefined && value !== null && value !== "") form.append(key, String(value));
    }
    if (image) form.append("image", image);
    const res = await privateApi.post("/user/profile/update", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /** POST /user/profile/password/update — form-data. */
  async updatePassword(payload: UpdatePasswordRequest) {
    const body = updatePasswordRequestSchema.parse(payload);
    const form = new FormData();
    for (const [key, value] of Object.entries(body)) form.append(key, String(value));
    const res = await privateApi.post("/user/profile/password/update", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /** POST /user/profile/delete/account — permanent. */
  async deleteAccount() {
    const res = await privateApi.post("/user/profile/delete/account");
    return res.data;
  },
};

export default profileService;
