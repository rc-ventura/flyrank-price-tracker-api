

export const trackers = [
  { id: 1, title: 'Tracker 1', done: false },
  { id: 2, title: 'Tracker 2', done: true },
  { id: 3, title: 'Tracker 3', done: false }
];


const  getTracker =  async () => {
    return tasks;
}

const getTrackerById = async (id) => {
    return tasks.find(task => task.id === id);
}



export default {
    getTracker,
    getTrackerById
};