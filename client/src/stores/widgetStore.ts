import { defineStore } from "pinia";
import axios from "../plugins/axios";

export const useWidgetsStore = defineStore("widgets", {
    state: () => ({
        widgets: [],
        widget: null,
        loading: false,
        error: null,
    }),
    actions: {
        async fetchWidgets() {
            this.loading = true;
            try {
                const response = await axios.get("api/widgets");
                this.widgets = response.data;
                this.error = null;
            } catch (error) {
                this.error = error.response?.data.message || error.message;
            } finally {
                this.loading = false;
            }
        },
        async createWidget(widget) {
            this.loading = true;
            try {
                const response = await axios.post("api/widgets", widget);
                this.widgets.push(response.data);
                this.error = null;
            } catch (error) {
                this.error = error.response?.data.message || error.message;
            } finally {
                this.loading = false;
            }
        },
        async updateWidget(id, widget) {
            this.loading = true;
            try {
                const response = await axios.put(`api/widgets/${id}`, widget);
                const index = this.widgets.findIndex(w => w._id === id);
                if (index !== -1) {
                    this.widgets.splice(index, 1, response.data);
                }
                this.error = null;
            } catch (error) {
                this.error = error.response?.data.message || error.message;
            } finally {
                this.loading = false;
            }
        },
        async deleteWidget(id) {
            this.loading = true;
            try {
                await axios.delete(`api/widgets/${id}`);
                this.widgets = this.widgets.filter(w => w._id !== id);
                this.error = null;
            } catch (error) {
                this.error = error.response?.data.message || error.message;
            } finally {
                this.loading = false;
            }
        },
    },
});
