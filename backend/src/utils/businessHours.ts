function isWithinBusinessHours(currentTime: Date, schedules: any[]): boolean {
  const now = new Date(currentTime);

  return schedules.some(schedule => {
    const start = new Date(currentTime);
    start.setHours(schedule.startHour, schedule.startMinute, 0, 0);

    const end = new Date(currentTime);
    end.setHours(schedule.endHour, schedule.endMinute, 0, 0);

    return now >= start && now <= end;
  });
}

export { isWithinBusinessHours };
