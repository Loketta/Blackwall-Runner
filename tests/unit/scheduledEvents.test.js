"use strict";

const assert = require("assert");
const {
  processScheduledEvents,
  applyScheduledEventEffect,
  createScheduledDomainEvent
} = require("../../src/game/events/scheduledEvents");

let passed = 0;
let failed = 0;

function test(name, testFunction) {
  try {
    testFunction();
    console.log(`PASS ${name}`);
    passed += 1;
  } catch (error) {
    console.log(`FAIL ${name}`);
    console.error(error);
    failed += 1;
  }
}

function createWorld(overrides = {}) {
  return {
    day: 2,
    currentTime: "09:00",
    calendar: {
      year: 2045,
      month: 3,
      dayOfMonth: 2
    },
    scheduledEvents: [],
    ...overrides
  };
}

function createShopOpenedEvent(overrides = {}) {
  return {
    type: "shop_opened",
    day: 2,
    time: "08:30",
    locationId: "market_1",
    data: {
      shopId: "shop_1"
    },
    ...overrides
  };
}

console.log("================================");
console.log("SCHEDULED EVENT TESTS");
console.log("================================");
console.log("");

test("Applies the shop opened effect", () => {
  const shops = [
    {
      id: "shop_1",
      isOpen: false
    }
  ];

  let savedShops = null;

  applyScheduledEventEffect(
    createShopOpenedEvent(),
    {
      loadShops() {
        return shops;
      },
      saveShops(updatedShops) {
        savedShops = updatedShops;
      }
    }
  );

  assert.strictEqual(shops[0].isOpen, true);
  assert.strictEqual(savedShops, shops);
});

test("Records a ShopOpened domain event", () => {
  const world = createWorld();
  const scheduledEvent = createShopOpenedEvent();

  let recordedData = null;
  const recordedEvent = {
    eventId: "event_1"
  };

  const result = createScheduledDomainEvent(
    world,
    scheduledEvent,
    {
      eventRecorder: {
        record(data) {
          recordedData = data;
          return recordedEvent;
        }
      }
    }
  );

  assert.strictEqual(result, recordedEvent);
  assert.deepStrictEqual(recordedData, {
    type: "ShopOpened",
    worldTime: "2045-03-02T09:00:00",
    targetIds: ["shop_1"],
    locationId: "market_1",
    payload: {
      shopId: "shop_1"
    },
    metadata: {
      source: "scheduledEvents"
    }
  });
});

test("Processes a due shop event and removes it", () => {
  const scheduledEvent = createShopOpenedEvent();
  const world = createWorld({
    scheduledEvents: [scheduledEvent]
  });

  const shops = [
    {
      id: "shop_1",
      isOpen: false
    }
  ];

  const recordedEvent = {
    eventId: "event_1"
  };

  const events = processScheduledEvents(world, {
    loadShops() {
      return shops;
    },
    saveShops() {},
    eventRecorder: {
      record() {
        return recordedEvent;
      }
    }
  });

  assert.strictEqual(shops[0].isOpen, true);
  assert.deepStrictEqual(events, [recordedEvent]);
  assert.deepStrictEqual(world.scheduledEvents, []);
});

test("Retains scheduled events that are not due", () => {
  const scheduledEvent = createShopOpenedEvent({
    time: "09:30"
  });

  const world = createWorld({
    scheduledEvents: [scheduledEvent]
  });

  const events = processScheduledEvents(world);

  assert.deepStrictEqual(events, []);
  assert.deepStrictEqual(
    world.scheduledEvents,
    [scheduledEvent]
  );
});

test("Returns no event without an event recorder", () => {
  const world = createWorld({
    scheduledEvents: [
      createShopOpenedEvent()
    ]
  });

  const shops = [
    {
      id: "shop_1",
      isOpen: false
    }
  ];

  const events = processScheduledEvents(world, {
    loadShops() {
      return shops;
    },
    saveShops() {}
  });

  assert.strictEqual(shops[0].isOpen, true);
  assert.deepStrictEqual(events, []);
  assert.deepStrictEqual(world.scheduledEvents, []);
});

test("Does not create a legacy event for an unknown type", () => {
  const world = createWorld();
  const scheduledEvent = {
    type: "unknown_event",
    day: 2,
    time: "08:30",
    locationId: null,
    data: {
      value: 1
    }
  };

  const result = createScheduledDomainEvent(
    world,
    scheduledEvent,
    {
      eventRecorder: {
        record() {
          throw new Error(
            "Recorder should not be called."
          );
        }
      }
    }
  );

  assert.strictEqual(result, null);
});

test("Consumes a due unknown event without emitting it", () => {
  const world = createWorld({
    scheduledEvents: [
      {
        type: "unknown_event",
        day: 2,
        time: "08:30",
        locationId: null,
        data: {}
      }
    ]
  });

  const events = processScheduledEvents(world);

  assert.deepStrictEqual(events, []);
  assert.deepStrictEqual(world.scheduledEvents, []);
});

test("Initialises a missing scheduled event collection", () => {
  const world = createWorld();
  delete world.scheduledEvents;

  const events = processScheduledEvents(world);

  assert.deepStrictEqual(events, []);
  assert.deepStrictEqual(world.scheduledEvents, []);
});

console.log("");
console.log("================================");
console.log(`${passed} passed`);
console.log(`${failed} failed`);
console.log("================================");

if (failed > 0) {
  process.exitCode = 1;
}
