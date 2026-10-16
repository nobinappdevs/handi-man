import { vendorPrivateApi } from "@/lib/axios";

/**
 * When a vendor can be booked - the vendor API root, so the vendor token.
 *
 *   GET  /vendors/service/schedule/list               the time slots
 *   POST /vendors/service/schedule/store              start_time, end_time ("HH:mm")
 *   POST /vendors/service/schedule/update             target, edit_start_time, edit_end_time
 *   GET  /vendors/service/schedule/delete   ?target=  (a GET that deletes - the API's choice)
 *   GET  /vendors/service/schedule/date/number        how many days ahead customers can book
 *   POST /vendors/service/schedule/date/update        service_schedule_date
 *
 * Times come back as "20:00:00" and go out as "20:00". Note `update` renames
 * its fields (`edit_start_time`) where `store` does not.
 */

export interface ScheduleSlotRecord {
  id: number;
  start_time: string;
  end_time: string;
  status?: number;
}

export interface ScheduleSlotPayload {
  start_time: string;
  end_time: string;
}

export const vendorScheduleService = {
  /** GET /vendors/service/schedule/list */
  async list(): Promise<{ data: { schedule?: ScheduleSlotRecord[] } }> {
    const res = await vendorPrivateApi.get("/vendors/service/schedule/list");
    return res.data;
  },

  /** POST /vendors/service/schedule/store */
  async create(payload: ScheduleSlotPayload) {
    const res = await vendorPrivateApi.post("/vendors/service/schedule/store", payload);
    return res.data;
  },

  /** POST /vendors/service/schedule/update */
  async update(id: number, payload: ScheduleSlotPayload) {
    const res = await vendorPrivateApi.post("/vendors/service/schedule/update", {
      target: id,
      edit_start_time: payload.start_time,
      edit_end_time: payload.end_time,
    });
    return res.data;
  },

  /** GET /vendors/service/schedule/delete?target= */
  async remove(id: number) {
    const res = await vendorPrivateApi.get("/vendors/service/schedule/delete", { params: { target: id } });
    return res.data;
  },

  /** GET /vendors/service/schedule/date/number - `schedule_number` is a string. */
  async getDays(): Promise<{ data: { schedule_number?: string | number } }> {
    const res = await vendorPrivateApi.get("/vendors/service/schedule/date/number");
    return res.data;
  },

  /** POST /vendors/service/schedule/date/update */
  async updateDays(days: number) {
    const res = await vendorPrivateApi.post("/vendors/service/schedule/date/update", {
      service_schedule_date: days,
    });
    return res.data;
  },
};

export default vendorScheduleService;
