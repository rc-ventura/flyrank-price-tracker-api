const trackers = [
  { id: 1, name: "Tech Store Headphones", url: "https://site1.com/p1", targetSelector: ".price", frequency: "daily", status: "active" },
  { id: 2, name: "Marketplace Monitor", url: "https://site2.com/p2", targetSelector: "#price-tag", frequency: "hourly", status: "active" },
  { id: 3, name: "Boutique Retailer", url: "https://site3.com/p3", targetSelector: "span.amount", frequency: "weekly", status: "paused" }
];

const getTrackers = async () => {
    return trackers;
}

const getTrackerById = async (id) => {
    return trackers.find(tracker => tracker.id === id);
}

export default {
    getTrackers,
    getTrackerById
};