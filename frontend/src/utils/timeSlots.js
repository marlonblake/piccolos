export const HOURS = {
    STEP_MINS: 30,
    RESERVATION_OPEN_MINS: 12 * 60,            // 12:00 PM
    RESERVATION_LAST_START_MINS: 23 * 60 + 30, // 11:30 PM
    PICKUP_OPEN_MINS: 12 * 60 + 30,            // 12:30 PM
    PICKUP_CLOSE_MINS: 24 * 60,                // 12:00 AM (stored as 23:59)
    CLOSE_MINS: 24 * 60                        // 12:00 AM (stored as 23:59)
};

export const formatLocalDate = (d = new Date()) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const minsToHHMM = (mins) => {
    if (mins >= 24 * 60) return "23:59";
    return `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
};

export const hhmmToMins = (hhmm) => {
    if (!hhmm) return 0;
    const short = String(hhmm).slice(0, 5);
    if (short === "23:59") return 24 * 60;
    const [h, m] = short.split(":").map(Number);
    return h * 60 + m;
};

export const formatTimeLabel = (hhmm) => {
    if (!hhmm) return "";
    const short = String(hhmm).slice(0, 5);
    if (short === "23:59") return "12:00 AM";
    const [h, m] = short.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
};

export const generateSlots = (startMins, endMins, step = HOURS.STEP_MINS) => {
    const slots = [];
    for (let m = startMins; m <= endMins; m += step) {
        slots.push(minsToHHMM(m));
    }
    return slots;
};

export const PICKUP_SLOTS = generateSlots(HOURS.PICKUP_OPEN_MINS, HOURS.PICKUP_CLOSE_MINS);
export const RESERVATION_START_SLOTS = generateSlots(HOURS.RESERVATION_OPEN_MINS, HOURS.RESERVATION_LAST_START_MINS);
export const RESERVATION_END_SLOTS = generateSlots(HOURS.RESERVATION_OPEN_MINS + HOURS.STEP_MINS, HOURS.CLOSE_MINS);

export const getNearestPickupSlot = () => {
    const now = new Date();
    const todayStr = formatLocalDate(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = formatLocalDate(tomorrow);

    const nowMins = now.getHours() * 60 + now.getMinutes();
    const nextMins = Math.max(
        HOURS.PICKUP_OPEN_MINS,
        Math.floor(nowMins / HOURS.STEP_MINS) * HOURS.STEP_MINS + HOURS.STEP_MINS
    );

    if (nextMins > HOURS.PICKUP_CLOSE_MINS) {
        return { minDate: tomorrowStr, date: tomorrowStr, time: minsToHHMM(HOURS.PICKUP_OPEN_MINS) };
    }
    return { minDate: todayStr, date: todayStr, time: minsToHHMM(nextMins) };
};

export const getValidPickupSlots = (dateStr) => {
    const now = new Date();
    if (dateStr !== formatLocalDate(now)) return PICKUP_SLOTS;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return PICKUP_SLOTS.filter((slot) => hhmmToMins(slot) > nowMins);
};

export const getNearestReservationSlot = () => {
    const now = new Date();
    const todayStr = formatLocalDate(now);
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomorrowStr = formatLocalDate(tomorrow);

    const nowMins = now.getHours() * 60 + now.getMinutes();
    const nextMins = Math.max(
        HOURS.RESERVATION_OPEN_MINS,
        Math.floor(nowMins / HOURS.STEP_MINS) * HOURS.STEP_MINS + HOURS.STEP_MINS
    );

    if (nextMins > HOURS.RESERVATION_LAST_START_MINS) {
        return {
            minDate: tomorrowStr,
            date: tomorrowStr,
            startTime: minsToHHMM(HOURS.RESERVATION_OPEN_MINS),
            endTime: minsToHHMM(Math.min(HOURS.RESERVATION_OPEN_MINS + 60, HOURS.CLOSE_MINS))
        };
    }

    return {
        minDate: todayStr,
        date: todayStr,
        startTime: minsToHHMM(nextMins),
        endTime: minsToHHMM(Math.min(nextMins + 60, HOURS.CLOSE_MINS))
    };
};

export const getValidReservationStartSlots = (dateStr) => {
    const now = new Date();
    if (dateStr !== formatLocalDate(now)) return RESERVATION_START_SLOTS;
    const nowMins = now.getHours() * 60 + now.getMinutes();
    return RESERVATION_START_SLOTS.filter((slot) => hhmmToMins(slot) > nowMins);
};

export const getValidReservationEndSlots = (startTime) => {
    const startMins = hhmmToMins(startTime);
    return RESERVATION_END_SLOTS.filter((slot) => hhmmToMins(slot) > startMins);
};