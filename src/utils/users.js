const users = [];

const addUser = ({ id, username, room }) => {

  // validate the data
  if (!username || !room) {
    return {
      error: "Username and Room are required",
    };
  }

  // Clean the Data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // check for existing user
  const isExistingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  // validate username
  if (isExistingUser) {
    return {
      error: "User already exists in the room!",
    };
  }

  // store the user
  const user = { id, username, room };

  users.push(user);

  return { user };
};

// remove the user
const removeUser = (id) => {
  // find the index of user
  const indexOfUser = users.findIndex((user) => {
    return user.id === id;
  });

  // check if the index exists
  if (indexOfUser !== -1) {
    // remove the suer
    return users.splice(indexOfUser, 1)[0];
  }
};

// get user
const getUser = (id) => {
  
  // find the user
  const user = users.find((user) => {
      return user.id === id;
  });

  

  // check if user exists
  if (!user) {
    return {
      error: `No user found with id: ${id}`,
    };
  }

  return user;
};

// get the users from the room
const getUsersInRoom = (room) => {
  const usersInRoom = users.filter((user) => user.room === room);

  // check if room has users
  if (!usersInRoom) {
    return {
      error: `No users found in room: ${room}`,
    };
  }

  return usersInRoom;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
};
