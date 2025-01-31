'use server'

let eventsCache: any = null;
let dateRangeCache: any = null;

export async function setWrappedData(events: any[], dateRange: any) {
  eventsCache = events;
  dateRangeCache = dateRange;
}

export async function getWrappedData() {
  return {
    events: eventsCache,
    dateRange: dateRangeCache
  };
} 