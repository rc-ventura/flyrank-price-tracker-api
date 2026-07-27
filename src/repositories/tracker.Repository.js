
const SEED_TRACKERS = [
  { id: 1, name: "Tech Store Headphones", 
    url: "https://site1.com/p1", 
    targetSelector: ".price", 
    frequency: "daily", 
    status: "active" },

  { id: 2, name: "Marketplace Monitor", 
    url: "https://site2.com/p2", 
    targetSelector: "#price-tag", 
    frequency: "hourly", 
    status: "active" },

  { id: 3, name: "Boutique Retailer", 
    url: "https://site3.com/p3", 
    targetSelector: "span.amount", 
    frequency: "weekly", 
    status: "paused" }
];


let trackers = SEED_TRACKERS.map((tracker, index) => ({...tracker}));

const findAll = async () => {
    return trackers.map(tracker => ({...tracker}));
}

const findById = async (id) => {
    const tracker = trackers.find(tracker => tracker.id === id);
    return tracker ? {...tracker} : null;
}

const create = async ({name, url, targetSelector, frequency, status}) => {
    const id = trackers.length === 0 ? 1 : Math.max(...trackers.map((t) => t.id)) + 1;
    const tracker = {id, name, url, targetSelector, frequency, status};
    trackers.push(tracker);
    return {...tracker };
}

const update = async (id, changes) => {
    const tracker = trackers.find((t) => t.id === id);
    if (!tracker) return null;
    Object.assign(tracker, changes);
    return {...tracker};
}

const remove = async (id) => {
    const index = trackers.findIndex((t) => t.id === id);
    if (index === -1) return false;
    trackers.splice(index, 1);
    return true;
}

export default {
    findAll,
    findById,
    create,
    update,
    remove
};
