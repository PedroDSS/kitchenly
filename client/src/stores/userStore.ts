import type { User } from "@/z-schemas/UserSchema";
import { defineStore } from "pinia";
import { useRouter } from "vue-router";
import axios from "../plugins/axios";

const router = useRouter();
interface UsersState {
  users: User[];
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useUsersStore = defineStore("users", {
  state: (): UsersState => ({
    users: [] as User[],
    user: null,
    loading: false,
    error: null,
  }),
  actions: {
    async fetchUsers(): Promise<void> {
      this.loading = true;
      try {
        const response = await axios.get("api/users");
        this.users = response.data;
      } catch (error: any) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    async deleteUser(id: string): Promise<void> {
      this.loading = true;
      try {
        await axios.delete(`api/users/${id}`);
        this.users = this.users.filter((user) => user._id !== id);
      } catch (error: any) {
        if (error.response && error.response.status === 403) {
        } else {
          this.error = error.message;
        }
      } finally {
        this.loading = false;
      }
    },
    async updateUser(id: string, user: User): Promise<void> {
      this.loading = true;
      try {
        await axios.patch(`api/users/${id}`, user);
        const index = this.users.findIndex((u) => u._id === user._id);
        this.users[index] = user;
      } catch (error: any) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    async createUser(user: User): Promise<void> {
      this.loading = true;
      try {
        await axios.post("api/users", user);
        this.users.push(user);
      } catch (error: any) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    async findUserById(id: string) {
      this.loading = true;
      try {
        const response = await axios.get(`api/users/${id}`);
        this.user = response.data;
        this.error = null;
      } catch (error) {
        this.error = error.message;
        this.user = null;
      } finally {
        this.loading = false;
      }
    },
  },
});
