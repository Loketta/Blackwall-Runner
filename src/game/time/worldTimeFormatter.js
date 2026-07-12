"use strict";

function formatWorldTime(world) {
  const year = String(world.calendar.year).padStart(4, "0");
  const month = String(world.calendar.month).padStart(2, "0");
  const day = String(world.calendar.dayOfMonth).padStart(2, "0");

  return `${year}-${month}-${day}T${world.currentTime}:00`;
}

module.exports = {
  formatWorldTime
};
